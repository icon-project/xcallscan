import { WebSocket } from 'ws'
import { ISubscriber, ISubscriberCallback } from '../../interfaces/ISubcriber'
import { CONTRACT, EVENT, NETWORK, RPC_URL, RPC_URLS, SUBSCRIBER_INTERVAL, WSS } from '../../common/constants'
import { subscriberLogger as logger } from '../logger/logger'
import { IbcDecoder } from '../decoder/IbcDecoder'
import { v4 as uuidv4 } from 'uuid'
import { toHex } from '@cosmjs/encoding'
import { sha256 } from '@cosmjs/crypto'
import { StargateClient } from '@cosmjs/stargate'
import { EventLogData } from '../../types/EventLog'
import { IDecoder } from '../../interfaces/IDecoder'

export class IbcSubscriber implements ISubscriber {
    ws!: WebSocket
    wsQuery: any
    decoder: IDecoder
    contractAddress: string

    reconnectInterval: number = SUBSCRIBER_INTERVAL * 2

    constructor(public network: string) {
        this.contractAddress = CONTRACT[this.network].xcall[0]
        this.decoder = new IbcDecoder()
    }

    private getEventName(events: any[]) {
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.CallMessageSent}`
            })
        )
            return EVENT.CallMessageSent
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.CallMessage}`
            })
        )
            return EVENT.CallMessage
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.CallExecuted}`
            })
        )
            return EVENT.CallExecuted
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.ResponseMessage}`
            })
        )
            return EVENT.ResponseMessage
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.RollbackMessage}`
            })
        )
            return EVENT.RollbackMessage
        if (
            events.find((e) => {
                return e.type == `wasm-${EVENT.RollbackExecuted}`
            })
        )
            return EVENT.RollbackExecuted

        return ''
    }

    private buildEventLog(block: any, tx: any, eventName: string, eventData: EventLogData) {
        const sender = (
            tx.events.find((e: any) => e.type == 'message' && e.attributes.filter((a: any) => a.key == 'sender').length > 0)['attributes'] as any[]
        ).find((a) => a.key == 'sender').value as string
        const contractAddress = (
            tx.events.find((e: any) => e.type == 'execute' && e.attributes.filter((a: any) => a.key == '_contract_address').length > 0)[
                'attributes'
            ] as any[]
        ).find((a) => a.key == '_contract_address').value as string
        const fee = (
            tx.events.find((e: any) => e.type == 'tx' && e.attributes.filter((a: any) => a.key == 'fee').length > 0)['attributes'] as any[]
        ).find((a) => a.key == 'fee').value as string

        return {
            // txRaw: tx.raw_log,
            blockNumber: Number(tx.height),
            blockTimestamp: Math.floor(new Date(block.header.time).getTime() / 1000),
            txHash: tx.hash,
            txFrom: sender ?? '',
            txTo: contractAddress ?? '',
            txFee: fee.replace('inj', '').replace('arch', '').replace('ntrn', ''),
            // txValue: msgExecuteContract.msg?.cross_transfer?.amount || msgExecuteContract.msg?.deposit?.amount || '0',
            eventName: eventName,
            eventData: eventData
        }
    }

    subscribe(callback: ISubscriberCallback) {
        const onmessage = async (event: any) => {
            const eventJson = JSON.parse(event)
            if (eventJson && eventJson.result && eventJson.result.data) {
                logger.info(`${this.network} ondata ${JSON.stringify(eventJson.result.data)}`)

                try {
                    const events = eventJson.result.data.value.TxResult.result.events as any[]
                    const txRaw = eventJson.result.data.value.TxResult.tx as string

                    const eventName = this.getEventName(events)
                    const eventLogData = await this.decoder.decodeEventLog(events, eventName)

                    if (eventLogData && txRaw) {
                        const txHash = toHex(sha256(Buffer.from(txRaw, 'base64')))
                        const client = await StargateClient.connect(RPC_URL[this.network])
                        const tx = await client.getTx(txHash)

                        if (tx) {
                            const block = await client.getBlock(tx?.height)
                            const eventLog = this.buildEventLog(block, tx, eventName, eventLogData)
                            client.disconnect()

                            callback(eventLog)
                        } else {
                            logger.info(`${this.network} ondata ${eventName} could not find tx ${txHash}`)
                        }
                    } else {
                        logger.info(`${this.network} ondata ${eventName} could not decodeEventLog`)
                    }
                } catch (error) {
                    logger.info(`${this.network} error ${JSON.stringify(error)}`)
                    logger.error(`${this.network} error ${JSON.stringify(error)}`)
                }
            }
        }

        this.connect(onmessage)
    }

    private disconnect() {
        logger.info(`${this.network} disconnect`)
        // If the WebSocket isn't open, exit the function.
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
        // Send an 'unsubscribe' message to the server.
        this.ws.send(JSON.stringify({ ...this.wsQuery, method: 'unsubscribe' }))
        // Close the WebSocket connection.
        this.ws.close()
    }

    private connect(onmessage: (data: any) => Promise<void>) {
        try {
            logger.info(`${this.network} connect ${WSS[this.network][0]}`)
            logger.info(`${this.network} listen events on ${this.contractAddress}`)

            // Open a new WebSocket connection to the specified URL.
            this.ws = new WebSocket(WSS[this.network][0])

            // Define the subscription request. It asks for transactions where the recipient address, and checks for transactions to be published.
            this.wsQuery = {
                jsonrpc: '2.0',
                method: 'subscribe',
                id: uuidv4().toString(),
                params: {
                    query: `tm.event = 'Tx' AND wasm._contract_address = '${this.contractAddress}'`
                }
            }
            // When the WebSocket connection is established, send the subscription request.
            this.ws.on('open', () => {
                logger.info(`${this.network} ws open sending the subscription request`)
                this.ws.send(JSON.stringify(this.wsQuery))
            })
            // When a message (i.e., a matching transaction) is received, log the transaction and close the WebSocket connection.
            this.ws.on('message', onmessage)
            // If an error occurs with the WebSocket, log the error and close the WebSocket connection.
            this.ws.on('error', (error: any) => {
                logger.info(`${this.network} ws error ${JSON.stringify(error)}`)
                this.disconnect()
            })
            this.ws.on('close', (code, reason) => {
                logger.info(`${this.network} ws close ${code} ${reason}`)
                this.disconnect()

                setTimeout(() => {
                    logger.info(`${this.network} ws reconnect...`)
                    this.connect(onmessage)
                }, this.reconnectInterval)
            })
            this.ws.on('ping', (data) => {})
            this.ws.on('pong', (data) => {})
        } catch (err) {
            // If an error occurs when trying to connect or subscribe, log the error and close the WebSocket connection.
            logger.error(`${this.network} error ${JSON.stringify(err)}`)
            this.disconnect()
        }
    }
}
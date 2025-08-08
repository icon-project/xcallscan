import axios from "axios";
import { ChainHandler } from "../../types/ChainHandler";
import { getMessageFromValue, stringToEncodedScVal } from "./utils";
import { Message } from "./types";
import { Address, xdr } from "@stellar/stellar-sdk";
import { TxPayload } from "../../types";

export class StellarHandler implements ChainHandler {
    private rpcUrl: string;

    constructor(config: { rpcUrl: string }) {
        this.rpcUrl = config.rpcUrl;
    }

    decodeAddress(address: string): string {
        const cleanHex = address.startsWith("0x") ? address.slice(2) : address;
        const scVal = xdr.ScVal.fromXDR(cleanHex, "hex");
        const addr = Address.fromScVal(scVal);
        return addr.toString();
    }


    async fetchPayload(txHash: string): Promise<TxPayload> {
        const jsonRpcRequest = {
            "jsonrpc": "2.0",
            "id": crypto.randomUUID(),
            "method": "getTransaction",
            "params": {
                "hash": txHash
            }
        };
        const response = (await axios.post(this.rpcUrl, jsonRpcRequest)).data;
        const txLedger = response.result.ledger
        const jsonEventRequest = {
            "id": crypto.randomUUID(),
            "jsonrpc": "2.0",
            "method": "getEvents",
            "params": {
                "startLedger": txLedger,
                "pagination": {
                    "limit": 1
                },
                "filters": [
                    {
                        "type": "contract",
                        "topics": [
                            [
                                stringToEncodedScVal("Message")
                            ]
                        ]
                    }
                ]
            }
        };
        const events = (await axios.post(this.rpcUrl, jsonEventRequest)).data;
        for (const event of events.result.events) {
            const msg: Message = getMessageFromValue(txHash, event.value)
            return {
                txnFee: "0",
                payload: Buffer.from(msg.payload, 'base64').toString('hex')
            }
        }
        return {
            txnFee: "0",
            payload: "0x"

        }
    }
}


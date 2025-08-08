import axios from "axios";
import { ChainHandler } from "../../types/ChainHandler";
import { TxPayload } from "../../types";

export class SuiHandler implements ChainHandler {
    private rpcUrl: string;

    constructor(config: { rpcUrl: string }) {
        this.rpcUrl = config.rpcUrl;
    }
    
    decodeAddress(address: string): string {
        return Buffer.from(address.replace("0x",""),'hex').toString()
    }

//     function hexToSolanaAddress(hex: string): string {
//     const bytes = Uint8Array.from(Buffer.from(hex.replace(/^0x/, ""), "hex"));
//     return bs58.encode(bytes);
// }
    async fetchPayload(txHash: string): Promise<TxPayload> {
        const jsonRpcRequest = {
            jsonrpc: "2.0",
            method: "sui_getEvents",
            params: [
                txHash
            ],
            id: 1
        };
        const parsedResponse = (await axios.post(this.rpcUrl, jsonRpcRequest)).data;
        for (const event of parsedResponse.result) {
            const parsedJson = event.parsedJson
            return {
                txnFee: "0",
                payload: Buffer.from(parsedJson.payload).toString("hex"),
            };
        }
        return {
            txnFee: "0",
            payload: "0x"
        }
    }
}

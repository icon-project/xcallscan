import axios from "axios";
import { getHandler } from './handler'
import { chains, sonic } from "./configs";
import { parsePayloadData } from "./action";
import { updateTransactionInfo } from "./db";
import dotenv from 'dotenv';
import { SendMessage, Transfer } from "./types";

dotenv.config();
const SODAXSCAN_CONFIG = {
    method: 'get',
    url: `${process.env.SCANNER_URL}/api/messages?skip=0&limit=10`,
    headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
    },
};


let lastScannedId = 0
let isRunning = true;

const main = async () => {
    const response = await axios.request(SODAXSCAN_CONFIG);
    for (const transaction of response.data.data) {
        const id = transaction.id
        if (lastScannedId !== 0 && id <= lastScannedId) {
            continue
        }
        const srcChainId = transaction.src_network as string
        const dstChainId = transaction.dest_network as string
        try {
            console.log("Processing txn", transaction.src_tx_hash)
            const txHash = transaction.src_tx_hash
            const payload = await getHandler(srcChainId).fetchPayload(txHash)
            const actionType = parsePayloadData(payload.payload, srcChainId, dstChainId)
            if (payload.intentFilled) {
                actionType.action = "IntentFilled"
                actionType.actionText = payload.actionText
                actionType.swapInputToken = payload.swapInputToken
                actionType.swapOutputToken = payload.swapOutputToken
            }
            const assetManager = chains[srcChainId].AssetManager
            let assetsInformation = chains[srcChainId].Assets
            if (srcChainId === sonic) {
                assetsInformation = chains[dstChainId].Assets
            }
            if (actionType.action === Transfer || actionType.action === SendMessage) {
                const dstAddress: string = payload.dstAddress || "";
                if (dstAddress.toLowerCase() === assetManager.toLowerCase()) {
                    actionType.action = 'Deposit';
                    const token = actionType.tokenAddress || ""
                    if (token in assetsInformation) {
                        actionType.denom = assetsInformation[token].name
                        actionType.actionText = `Deposit ${actionType.amount} ${actionType.denom}`
                    } else {
                        actionType.actionText = `Deposit ${actionType.amount} ${actionType.tokenAddress}`
                    }
                }
            }
            // console.log(actionType)
            console.log(`Action: ${actionType.action} \nAction Details: ${actionType.actionText} \nTransaction Fee: ${payload.txnFee}\n\n`)
            await updateTransactionInfo(id, payload.txnFee, actionType.action, actionType.actionText || "")
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : String(error);
            console.log("Failed updating transaction info for id", id, errMessage)
        }
    }
    lastScannedId = response.data.data[0].id

}
main().catch(console.error).finally(() => {
    isRunning = false;
});

const intervalId = setInterval(() => {
    if (isRunning) return;
    isRunning = true;
    main().catch(console.error).finally(() => {
        isRunning = false;
    });
}, 5000);

function shutdownHandler(signal: string) {
  return () => {
    console.log(`Received ${signal}. Cleaning up...`);
    clearInterval(intervalId);
    process.exit(0); // Exit cleanly
  };
}

process.on('SIGINT', shutdownHandler('SIGINT'));
process.on('SIGTERM', shutdownHandler('SIGTERM'));
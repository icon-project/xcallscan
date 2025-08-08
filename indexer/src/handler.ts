import { arbitrum, avax, base, botanix, bsc, hyperliquid, icon, nibiru, optimism, polygon, RPC_URLS, sonic, stellar, sui } from './configs.ts';
import { EvmHandler } from './chains/evm/index.ts';
import { ChainHandler } from './types/ChainHandler';
import { StellarHandler } from './chains/stellar/index.ts';
import { IconHandler } from './chains/icon/index.ts';
import { SuiHandler } from './chains/sui/index.ts';


const handlers: Record<string, ChainHandler> = {
    [base]: new EvmHandler({ rpcUrl: RPC_URLS[base] }),
    [avax]: new EvmHandler({ rpcUrl: RPC_URLS[avax], denom: "AVAX" }),
    [sonic]: new EvmHandler({ rpcUrl: RPC_URLS[sonic], denom: "Sonic" }),
    [hyperliquid]: new EvmHandler({ rpcUrl: RPC_URLS[hyperliquid], denom: "HYPE" }),
    [arbitrum]: new EvmHandler({ rpcUrl: RPC_URLS[arbitrum] }),
    [optimism]: new EvmHandler({ rpcUrl: RPC_URLS[optimism] }),
    [nibiru]: new EvmHandler({ rpcUrl: RPC_URLS[nibiru], denom: "NIBI" }),
    [polygon]: new EvmHandler({ rpcUrl: RPC_URLS[polygon], denom: "POL" }),
    [bsc]: new EvmHandler({ rpcUrl: RPC_URLS[bsc], denom: "BNB" }),
    [botanix]: new EvmHandler({ rpcUrl: RPC_URLS[botanix], denom: "BTC" }),
    [stellar]: new StellarHandler({ rpcUrl: RPC_URLS[stellar] }),
    [icon]: new IconHandler({ rpcUrl: RPC_URLS[icon] }),
    [sui]: new SuiHandler({ rpcUrl: RPC_URLS[sui] }),
};

export function getHandler(chain: string): ChainHandler {
    const handler = handlers[chain];
    if (!handler) throw new Error(`No handler registered for chain: ${chain}`);
    return handler;
}


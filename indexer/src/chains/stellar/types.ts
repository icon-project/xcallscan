export type Message = {
  srcChainId: string;
  srcAddress: string;
  dstChainId: string;
  dstAddress: string;
  connSn: string;
  payload: string;
  txHash: string;
}
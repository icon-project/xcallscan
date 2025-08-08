export type msg = {
  srcChainId: bigint,
  srcAddress: Uint8Array,
  connSn: bigint,
  dstChainId: bigint,
  dstAddress: Uint8Array,
  payload: Uint8Array,
}
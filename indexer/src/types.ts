
export type Action = "Supply" | "Borrow" | "Repay" | "Transfer" | "SendMessage" | "Deposit" | "Withdraw" | "CreateIntent" | "CancelIntent" | "IntentFilled"


export const SendMessage = "SendMessage"
export const Transfer = "Transfer"
export type actionType = {
  action: Action
  amount?: string
  tokenAddress?: string
  denom?: string
  swapInputToken?: string
  swapOutputToken?: string
  actionText?: string
}

export interface TxPayload {
  txnFee: string
  payload: string
  intentFilled?: boolean
  dstAddress?: string,
  swapInputToken?: string
  swapOutputToken?: string
  actionText?: string
}
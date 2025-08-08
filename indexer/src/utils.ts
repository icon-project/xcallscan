export function bigintDivisionToDecimalString(num: bigint, decimals: number) {
    const denom = BigInt(10 ** decimals)
    const integerPart = num / denom;
    const remainder = num % denom;
    const scaledRemainder = remainder * (10n ** BigInt(decimals)) / denom;
    let decimalPart = scaledRemainder.toString().padStart(decimals, '0');
    decimalPart = decimalPart.replace(/0+$/, '');
    if(!decimalPart){
        decimalPart = "0"
    }
    return `${integerPart.toString()}.${decimalPart}`;
}

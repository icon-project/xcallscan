import { ethers } from 'ethers'
import logger from '../modules/logger/logger'

export class RetriableStaticJsonRpcProvider extends ethers.providers.StaticJsonRpcProvider {
    providerList: ethers.providers.StaticJsonRpcProvider[]
    currentIndex = 0
    error: any

    constructor(rpcs: string[], pollingInterval: number) {
        super({ url: rpcs[0] })
        this.pollingInterval = pollingInterval

        this.providerList = rpcs.map((url) => {
            const provider = new ethers.providers.StaticJsonRpcProvider({ url })
            provider.pollingInterval = pollingInterval

            return provider
        })
    }

    async send(method: string, params: Array<any>, retries?: number): Promise<any> {
        let _retries = retries || 0

        /**
         * validate retries before continue
         * base case of recursivity (throw if already try all rpcs)
         */
        this.validateRetries(_retries)

        try {
            // select properly provider
            const provider = this.selectProvider()

            // send rpc call
            logger.error(`RetriableStaticJsonRpcProvider ${provider.connection.url} sending...`)
            return await provider.send(method, params)
        } catch (error) {
            // store error internally
            this.error = error

            logger.error(`RetriableStaticJsonRpcProvider ${this.providerList[this.currentIndex].connection.url} send failed ${_retries}`)

            // increase retries
            _retries = _retries + 1

            return this.send(method, params, _retries)
        }
    }

    private selectProvider() {
        // last rpc from the list
        if (this.currentIndex === this.providerList.length) {
            // set currentIndex to the seconds element
            this.currentIndex = 1
            return this.providerList[0]
        }

        // select current provider
        const provider = this.providerList[this.currentIndex]
        // increase counter
        this.currentIndex = this.currentIndex + 1

        return provider
    }

    /**
     * validate that retries is equal to the length of rpc
     * to ensure rpc are called at least one time
     *
     * if that's the case, and we fail in all the calls
     * then throw the internal saved error
     */
    private validateRetries(retries: number) {
        if (retries === this.providerList.length) {
            const error = this.error
            this.error = undefined
            // throw new Error(error)
            logger.error(`RetriableStaticJsonRpcProvider validateRetries error`)
        }
    }
}

export class RotatableStaticJsonRpcProvider extends ethers.providers.StaticJsonRpcProvider {
    providerList: ethers.providers.StaticJsonRpcProvider[]

    constructor(rpcs: string[], pollingInterval: number) {
        super({ url: rpcs[0] })
        this.pollingInterval = pollingInterval

        this.providerList = rpcs.map((url) => {
            const provider = new ethers.providers.StaticJsonRpcProvider({ url })
            provider.pollingInterval = pollingInterval
            return provider
        })
    }

    async send(method: string, params: Array<any>, providerIndex?: number): Promise<any> {
        let _providerIndex = providerIndex || 0

        const provider = this.providerList[_providerIndex]

        try {
            return await provider.send(method, params)
        } catch (error) {
            _providerIndex = _providerIndex + 1
            if (_providerIndex > this.providerList.length) _providerIndex = 0

            return this.send(method, params, _providerIndex)
        }
    }
}


const TestnetDeployment = require('../configs/testnet_deployment.json')
const MainnetDeployment = require('../configs/mainnet_deployment.json')
const USE_MAINNET = process.env.USE_MAINNET == 'true'
const CONFIG_NETWORKS = USE_MAINNET ? MainnetDeployment.networks : TestnetDeployment.networks

const NETWORK = {
    AVAX: 'avax',
    SUI: 'sui',
    NEAR: 'near',
    SONIC: 'sonic',
    ICON: 'icon',
    INJECTIVE: 'injective',
    STELLAR: 'stellar',
    SOLANA: 'solana',
    ARCHWAY: 'archway',
}

const NETWORK_MAPPINGS = {
    [NETWORK.SUI]: CONFIG_NETWORKS.sui.nid,
    [NETWORK.AVAX]: CONFIG_NETWORKS.avax.nid,
    [NETWORK.NEAR]: CONFIG_NETWORKS.near.nid,
    [NETWORK.SONIC]: CONFIG_NETWORKS.sonic.nid,
    [NETWORK.ICON]: CONFIG_NETWORKS.icon.nid,
    [NETWORK.INJECTIVE]: CONFIG_NETWORKS.injective.nid,
    [NETWORK.STELLAR]: CONFIG_NETWORKS.stellar.nid,
    [NETWORK.SOLANA]: CONFIG_NETWORKS.solana.nid,
    [NETWORK.ARCHWAY]: CONFIG_NETWORKS.archway.nid,
}

const REV_NETWORK_MAPPINGS = {
    [CONFIG_NETWORKS.sui.nid]: [NETWORK.SUI],
    [CONFIG_NETWORKS.avax.nid]: [NETWORK.AVAX],
    [CONFIG_NETWORKS.near.nid]: [NETWORK.NEAR],
    [CONFIG_NETWORKS.sonic.nid]: [NETWORK.SONIC],
    [CONFIG_NETWORKS.icon.nid]: [NETWORK.ICON],
    [CONFIG_NETWORKS.injective.nid]: [NETWORK.INJECTIVE],
    [CONFIG_NETWORKS.stellar.nid]: [NETWORK.STELLAR],
    [CONFIG_NETWORKS.solana.nid]: [NETWORK.SOLANA],
    [CONFIG_NETWORKS.archway.nid]: [NETWORK.ARCHWAY],
}

const NETWORK_DETAILS = {
    [NETWORK.AVAX]: {
        id: NETWORK.AVAX,
        name: 'Avax',
        logo: `/images/network-avax.png`,
        nativeAsset: 'AVAX',
    },
    [NETWORK.SUI]: {
        id: NETWORK.SUI,
        name: 'Sui',
        logo: `/images/network-sui.png`,
        nativeAsset: 'SUI',
    },
    [NETWORK.NEAR]: {
        id: NETWORK.NEAR,
        name: 'Near',
        logo: `/images/network-near.png`,
        nativeAsset: 'NEAR',
    },
    [NETWORK.SONIC]: {
        id: NETWORK.SONIC,
        name: 'Sonic',
        logo: `/images/network-sonic.png`,
        nativeAsset: 'Sonic',
    },
    [NETWORK.ICON]: {
        id: NETWORK.ICON,
        name: 'Icon',
        logo: `/images/network-icon.png`,
        nativeAsset: 'ICX',
    },
    [NETWORK.INJECTIVE]: {
        id: NETWORK.INJECTIVE,
        name: 'Injective',
        logo: `/images/network-injective.png`,
        nativeAsset: 'INJ',
    },
    [NETWORK.STELLAR]: {
        id: NETWORK.STELLAR,
        name: 'stellar',
        logo: `/images/network-stellar.png`,
        nativeAsset: 'XLM',
    },
    [NETWORK.SOLANA]: {
        id: NETWORK.SOLANA,
        name: 'solana',
        logo: `/images/network-solana.png`,
        nativeAsset: 'SOL',
    },
    [NETWORK.ARCHWAY]: {
        id: NETWORK.ARCHWAY,
        name: 'archway',
        logo: `/images/network-archway.png`,
        nativeAsset: 'const',
    },
}

const MSG_ACTION_TYPES = {
    SendMsg: 'SendMsg',
    Transfer: 'Transfer',
    Swap: 'Swap',
    Loan: 'Loan'
}

const getNativeAsset = (network) => {
    return NETWORK_DETAILS[REV_NETWORK_MAPPINGS[network]].nativeAsset
}

const getNetworks = () => {
    return Object.values(NETWORK_DETAILS)
}

const getMsgTypes = () => {
    return Object.values(MSG_ACTION_TYPES)
}

export default {
    getNativeAsset,
    getNetworks,
    getMsgTypes,
    REV_NETWORK_MAPPINGS,
    NETWORK_MAPPINGS
}

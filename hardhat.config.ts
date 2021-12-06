import '@nomiclabs/hardhat-waffle'
import 'hardhat-abi-exporter'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/types/config'
import './src/tasks/deploy_contracts'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const NETWORK = process.env.NETWORK || ''
const RPC_URL = process.env.RPC_URL || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const gasPrice = 50000000000 // 2 gwei
const COINMARKETCAP = process.env.COINMARKETCAP || ''

const networkSettings =
  NETWORK && RPC_URL && PRIVATE_KEY
    ? {
        [NETWORK]: {
          url: RPC_URL,
          accounts: [`0x${PRIVATE_KEY}`],
          gasPrice,
        },
      }
    : {}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  paths: {
    artifacts: 'build/artifacts',
    cache: 'build/cache',
    deploy: 'src/deploy',
    sources: 'contracts',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 0,
      },
      gasPrice: gasPrice,
    },
    ganache: {
      url: 'http://0.0.0.0:7545',
    },
    ...networkSettings,
  },
  gasReporter: {
    enabled: true,
    currency: 'JPY',
    gasPrice: 20,
    coinmarketcap: COINMARKETCAP,
  },
}
export default config

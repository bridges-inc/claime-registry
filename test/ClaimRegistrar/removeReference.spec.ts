import { Contract } from '@ethersproject/contracts'
import { expect } from 'chai'
import { deployments, network, waffle } from 'hardhat'
import { getClaimRegistrarContract } from '../utils/setup'

const setNextBlock = async () => {
  const now = Date.now()
  await network.provider.send('evm_setNextBlockTimestamp', [now])
  await network.provider.send('evm_mine')
  return now
}

describe('ClaimRegistrar', async () => {
  const [connectedUser, user2] = waffle.provider.getWallets()

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    return {
      registrar: await getClaimRegistrarContract(),
    }
  })

  describe('claimWithExternal', async () => {
    const externalReference = {
      storageName: 'arweave',
      key: 'metadatakey',
    }

    let registrar: Contract
    beforeEach(async () => {
      const contracts = await setupTests()
      registrar = contracts.registrar
      registrar.connect(connectedUser)
      await setNextBlock()
    })

    it('should remove external reference updating with blank', async () => {
      const { storageName, key } = externalReference
      await registrar.registerReference(storageName, key)

      const [_, storedName, storedKey] = await registrar.listClaimKeys(
        connectedUser.address
      )
      expect(storedName).to.be.eq(storageName)
      expect(storedKey).to.be.eq(key)

      await registrar.removeReference()
      const [__, nameRemoved, keyRemoved] = await registrar.listClaimKeys(
        connectedUser.address
      )
      expect(nameRemoved).to.be.eq('')
      expect(keyRemoved).to.be.eq('')
    })
  })
})

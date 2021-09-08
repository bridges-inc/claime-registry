import { Contract } from '@ethersproject/contracts'
import { expect } from 'chai'
import { deployments, network, waffle } from 'hardhat'
import { getClaimRegistryContract } from '../utils/setup'

const setNextBlock = async () => {
  const now = Date.now()
  await network.provider.send('evm_setNextBlockTimestamp', [now])
  await network.provider.send('evm_mine')
  return now
}

describe('ClaimRegistry', async () => {
  const [connectedUser, user2] = waffle.provider.getWallets()

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    return {
      registry: await getClaimRegistryContract(),
    }
  })

  describe('claimWithExternal', async () => {
    const externalReference = {
      ref: 'arweave',
      key: 'metadatakey',
    }

    let registry: Contract
    beforeEach(async () => {
      const contracts = await setupTests()
      registry = contracts.registry
      registry.connect(connectedUser)
      await setNextBlock()
    })

    it('should remove external reference updating with blank', async () => {
      const { ref, key } = externalReference
      await registry.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registry.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)

      await expect(registry.removeRef())
        .to.emit(registry, 'ClaimRefRemoved')
        .withArgs(connectedUser.address)
      const [__, [refRemoved, keyRemoved]] = await registry.listClaims(
        connectedUser.address
      )
      expect(refRemoved).to.be.eq('')
      expect(keyRemoved).to.be.eq('')
    })
  })
})

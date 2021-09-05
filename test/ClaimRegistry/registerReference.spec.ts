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

  describe('registerReference', async () => {
    const reference = {
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

    it('should new a external reference', async () => {
      const { ref, key } = reference
      await registry.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registry.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)
    })
    it('should update a external reference', async () => {
      const { ref, key } = reference
      const key2 = key + '2'
      await registry.registerRef(ref, key2)

      const [_, [storedRef, storedKey]] = await registry.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key2)
    })
    it('should new a external reference by another account', async () => {
      const { ref, key } = reference
      await registry.registerRef(ref, key)
      const registry2 = registry.connect(user2)
      await registry2.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registry.listClaims(
        connectedUser.address
      )
      const [__, [storedRef2, storedKey2]] = await registry.listClaims(
        user2.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)
      expect(storedRef2).to.be.eq(ref)
      expect(storedKey2).to.be.eq(key)
    })
    it('should remove external reference updating with blank', async () => {
      await registry.registerRef('', '')

      const [_, [storedRef, storedKey]] = await registry.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq('')
      expect(storedKey).to.be.eq('')
    })
  })
})

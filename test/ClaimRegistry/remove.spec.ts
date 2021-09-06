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

  describe('remove', async () => {
    const domainClaim = {
      propertyType: 'Domain',
      propertyId: 'example.com',
      evidence: 'example.com',
      method: 'TXT',
    }

    let registry: Contract
    beforeEach(async () => {
      const contracts = await setupTests()
      registry = contracts.registry
      registry.connect(connectedUser)
      await setNextBlock()
    })

    it('should remove a claim', async () => {
      const { propertyType, propertyId, evidence, method } = domainClaim
      await registry.register(propertyType, propertyId, evidence, method)
      const anotherId = propertyId + '2'
      await registry.register(propertyType, anotherId, evidence, method)

      const [claimKeys] = await registry.listClaims(connectedUser.address)
      expect(claimKeys).to.have.length(2)
      await registry.remove(propertyType, anotherId)
      const [keyRemoved] = await registry.listClaims(connectedUser.address)
      expect(keyRemoved).to.have.length(1)
      expect((await registry.allClaims(keyRemoved[0]))[1]).to.be.eq(propertyId)
    })
  })
})

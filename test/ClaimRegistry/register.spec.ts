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

  describe('register', async () => {
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

    it('should new a claim', async () => {
      const { propertyType, propertyId, method, evidence } = domainClaim
      await expect(
        registry.register(propertyType, propertyId, method, evidence)
      )
        .to.emit(registry, 'ClaimUpdated')
        .withArgs(connectedUser.address, [
          propertyType,
          propertyId,
          method,
          evidence,
        ])

      const claimKeys = await registry.listClaims(connectedUser.address)
      expect(claimKeys).to.have.length(1)
      const res = await registry.allClaims(claimKeys[0])
      expect(res).to.deep.equal([propertyType, propertyId, method, evidence])
    })
    it('should add a claim if the same propery, method and another id', async () => {
      const { propertyType, propertyId, method, evidence } = domainClaim
      await registry.register(propertyType, propertyId, method, evidence)
      const anotherId = propertyId + '2'
      await registry.register(propertyType, anotherId, method, evidence)

      const claimKeys = await registry.listClaims(connectedUser.address)
      expect(claimKeys).to.have.length(2)
      expect((await registry.allClaims(claimKeys[0]))[1]).to.deep.equal(
        propertyId
      )
      expect((await registry.allClaims(claimKeys[1]))[1]).to.deep.equal(
        anotherId
      )
    })
    it('should add a claim if the same propery, id and another method', async () => {
      const { propertyType, propertyId, method, evidence } = domainClaim
      await registry.register(propertyType, propertyId, method, evidence)
      const anotherMethod = method + '2'
      await registry.register(propertyType, propertyId, anotherMethod, evidence)

      const claimKeys = await registry.listClaims(connectedUser.address)
      expect(claimKeys).to.have.length(2)
      expect((await registry.allClaims(claimKeys[0]))[2]).to.deep.equal(method)
      expect((await registry.allClaims(claimKeys[1]))[2]).to.deep.equal(
        anotherMethod
      )
    })
    it('should update a claim if the same key', async () => {
      const { propertyType, propertyId, method, evidence } = domainClaim
      await registry.register(propertyType, propertyId, method, evidence)
      const anotherEvidence = evidence + '2'
      await registry.register(propertyType, propertyId, method, anotherEvidence)

      const claimKeys = await registry.listClaims(connectedUser.address)
      expect(claimKeys).to.have.length(1)
      expect((await registry.allClaims(claimKeys[0]))[3]).to.deep.equal(
        anotherEvidence
      )
    })
    it('should new a claim to the same property by another account', async () => {
      const { propertyType, propertyId, method, evidence } = domainClaim
      await registry.register(propertyType, propertyId, method, evidence)

      const registry2 = registry.connect(user2)
      await registry2.register(propertyType, propertyId, method, evidence)

      const claimKeys1 = await registry.listClaims(connectedUser.address)
      expect(claimKeys1).to.have.length(1)
      const claimKeys2 = await registry.listClaims(user2.address)
      expect(claimKeys2).to.have.length(1)
      expect(claimKeys1[0]).to.not.eq(claimKeys2[0])
    })
    it('fail if property type is blank', async () => {
      const { propertyId, method, evidence } = domainClaim
      await expect(
        registry.register('', propertyId, method, evidence)
      ).to.be.revertedWith('CLM001')
    })
    it('fail if property id is blank', async () => {
      const { propertyType, method, evidence } = domainClaim
      await expect(
        registry.register(propertyType, '', method, evidence)
      ).to.be.revertedWith('CLM002')
    })
  })
})

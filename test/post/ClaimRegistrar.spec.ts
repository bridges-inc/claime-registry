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
  const [user1] = waffle.provider.getWallets()

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    return {
      registrar: await getClaimRegistrarContract(),
    }
  })

  describe('claim', async () => {
    const domainClaim = {
      propertyType: 'Domain',
      propertyId: 'example.com',
      evidence: 'example.com',
      method: 'TXT',
    }
    it('should new a claim', async () => {
      const { registrar } = await setupTests()
      registrar.connect(user1)
      await setNextBlock()
      const { propertyType, propertyId, evidence, method } = domainClaim
      await registrar.claim(propertyType, propertyId, evidence, method)
      const claimKeys = await registrar.listClaimKeys(user1.address)
      expect(claimKeys).to.have.length(1)
      const res = await registrar.allClaims(claimKeys[0])
      expect(res).to.deep.equal([propertyType, propertyId, evidence, method])
    })
    it('fail if property type is blank', async () => {
      const { registrar } = await setupTests()
      registrar.connect(user1)
      await setNextBlock()
      const { propertyId, evidence, method } = domainClaim
      await expect(
        registrar.claim('', propertyId, evidence, method)
      ).to.be.revertedWith('CLM001')
    })
    it('fail if property id is blank', async () => {
      const { registrar } = await setupTests()
      registrar.connect(user1)
      await setNextBlock()
      const { propertyType, evidence, method } = domainClaim
      await expect(
        registrar.claim(propertyType, '', evidence, method)
      ).to.be.revertedWith('CLM002')
    })
  })
})

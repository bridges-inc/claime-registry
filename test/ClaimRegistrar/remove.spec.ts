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

  describe('remove', async () => {
    const domainClaim = {
      propertyType: 'Domain',
      propertyId: 'example.com',
      evidence: 'example.com',
      method: 'TXT',
    }

    let registrar: Contract
    beforeEach(async () => {
      const contracts = await setupTests()
      registrar = contracts.registrar
      registrar.connect(connectedUser)
      await setNextBlock()
    })

    it('should remove a claim', async () => {
      const { propertyType, propertyId, evidence, method } = domainClaim
      await registrar.claim(propertyType, propertyId, evidence, method)
      const anotherId = propertyId + '2'
      await registrar.claim(propertyType, anotherId, evidence, method)

      const [claimKeys] = await registrar.listClaimKeys(connectedUser.address)
      expect(claimKeys).to.have.length(2)
      await registrar.remove(propertyType, propertyId)
      const [keyRemoved] = await registrar.listClaimKeys(connectedUser.address)
      expect(keyRemoved).to.have.length(1)
      expect((await registrar.allClaims(keyRemoved[0]))[1]).to.be.eq(anotherId)
    })
  })
})

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
      ref: 'arweave',
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
      const { ref, key } = externalReference
      await registrar.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registrar.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)

      await registrar.removeRef()
      const [__, [refRemoved, keyRemoved]] = await registrar.listClaims(
        connectedUser.address
      )
      expect(refRemoved).to.be.eq('')
      expect(keyRemoved).to.be.eq('')
    })
  })
})

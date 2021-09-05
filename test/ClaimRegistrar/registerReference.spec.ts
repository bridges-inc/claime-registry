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

  describe('registerReference', async () => {
    const reference = {
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

    it('should new a external reference', async () => {
      const { ref, key } = reference
      await registrar.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registrar.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)
    })
    it('should update a external reference', async () => {
      const { ref, key } = reference
      const key2 = key + '2'
      await registrar.registerRef(ref, key2)

      const [_, [storedRef, storedKey]] = await registrar.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key2)
    })
    it('should new a external reference by another account', async () => {
      const { ref, key } = reference
      await registrar.registerRef(ref, key)
      const registrar2 = registrar.connect(user2)
      await registrar2.registerRef(ref, key)

      const [_, [storedRef, storedKey]] = await registrar.listClaims(
        connectedUser.address
      )
      const [__, [storedRef2, storedKey2]] = await registrar.listClaims(
        user2.address
      )
      expect(storedRef).to.be.eq(ref)
      expect(storedKey).to.be.eq(key)
      expect(storedRef2).to.be.eq(ref)
      expect(storedKey2).to.be.eq(key)
    })
    it('should remove external reference updating with blank', async () => {
      await registrar.registerRef('', '')

      const [_, [storedRef, storedKey]] = await registrar.listClaims(
        connectedUser.address
      )
      expect(storedRef).to.be.eq('')
      expect(storedKey).to.be.eq('')
    })
  })
})

import hre, { deployments } from 'hardhat'

export const getClaimRegistryContract = async () => {
  const Deployment = await deployments.get('ClaimRegistry')
  const contract = await hre.ethers.getContractFactory('ClaimRegistry')
  return contract.attach(Deployment.address)
}

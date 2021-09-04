import hre, { deployments } from 'hardhat'

export const getClaimRegistrarContract = async () => {
  const Deployment = await deployments.get('ClaimRegistrar')
  const contract = await hre.ethers.getContractFactory('ClaimRegistrar')
  return contract.attach(Deployment.address)
}

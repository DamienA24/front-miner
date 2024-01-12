import { Contract } from "ethers";
import { contracts } from "../constants/contract";
import { CHAIN_ID, LOCAL, MUMBAI, POLYGON } from "../constants";
import ABI from "../constants/abi/index.json";

const getContract = (abi, address, signer) => {
  return new Contract(address, abi, signer);
};

export const getBananaContract = (signer) => {
  return getContract(ABI, contracts.BANANA[POLYGON], signer);
};

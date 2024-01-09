import { Web3Provider } from "@ethersproject/providers";

export function getProvider(provider) {
  return new Web3Provider(provider);
}

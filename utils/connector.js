import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [
    1, 5, 4002, 56, 97, 2, 4, 31337, 43114, 250, 137, 25, 42161, 1088, 588,
    421613, 10, 2000, 80001,
  ],
});

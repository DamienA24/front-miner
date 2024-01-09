import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { CHAIN_ID } from "../constants";
import { useEagerConnect, useInactiveListener } from "../utils/hooks";
import { injected } from "../utils/connector";
/* import connectButton from "../img/COWALLET.png";
import switchButton from "../img/ASWICTH.png"; */

const ConnectButton = () => {
  const { activate, library, chainId } = useWeb3React();

  const [activating, setActivating] = useState(false);

  const handleActivate = () => {
    const _activate = async (activate) => {
      setActivating(true);
      await activate(injected);
      setActivating(false);
    };

    _activate(activate);
  };

  const eagerConnectionSuccessful = useEagerConnect();
  useInactiveListener(!eagerConnectionSuccessful);

  const switchNetwork = () => {
    if (library) {
      try {
        library.provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: `0x${CHAIN_ID.toString(16)}`,
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (chainId && chainId !== CHAIN_ID) {
    return (
      <a className="my-button" href="#" onClick={switchNetwork}>
        Switch Network
      </a>
    );
  }

  return (
    /*  <img
      className="button-c"
      src={connectButton}
      onClick={handleActivate}
      width="180"
    /> */
    <a className="my-button" onClick={handleActivate}>
      Connect
    </a>
  );
};

export default ConnectButton;

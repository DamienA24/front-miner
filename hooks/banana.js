import { BigNumber, ethers } from "ethers";
import { contracts } from "../constants/contract";
import { useEffect, useState } from "react";
import { CHAIN_ID, LOCAL, MUMBAI, POLYGON } from "../constants";
import { MultiCall } from "@indexed-finance/multicall";
import ABI from "../constants/abi/index.json";

export const useBanaStats = (
  library,
  account,
  refresh,
  chainId,
  update,
  contract
) => {
  const [stats, setStats] = useState({
    pendingRewards: BigNumber.from(0),
    accTokenPerShare: BigNumber.from(0),
    tvl: BigNumber.from(0),
    referral: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balance = await library.getBalance(contracts.BANANA[POLYGON]);
        const miners = await contract.getMyMiners({ from: account });
        const printers = await contract.getMyPrinters({ from: account });

        const tvlDollars = parseFloat(ethers.utils.formatEther(balance)) * 0.92;
        const minerss = ethers.utils.formatEther(miners) * 100000000000000;
        setStats({
          pendingRewards: printers,
          miners: minerss,
          tvl: balance,
          tvlDollars: tvlDollars.toFixed(2),
        });
      } catch (e) {
        console.log(e);
      }
    };

    if (account && library && POLYGON === chainId) {
      fetchData();
    }
  }, [library, account, chainId, refresh, update]);

  return stats;
};

export const approveSpender = async (wethContract, spender, amount) => {
  if (wethContract.signer) {
    try {
      const tx = await wethContract.approve(spender, amount);
      return await tx.wait();
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    return false;
  }
};

export const depositVault = async (bananaContract, amount, ref) => {
  if (bananaContract.signer) {
    try {
      if (!ref) ref = "0x0000000000000000000000000000000000000000";
      const tx = await bananaContract.deposit(ref, { value: amount });
      return await tx.wait();
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    return false;
  }
};

export const claimVault = async (bananaContract) => {
  if (bananaContract.signer) {
    try {
      const tx = await bananaContract.withdraw();
      return await tx.wait();
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    return false;
  }
};

export const compoundVault = async (bananaContract, ref) => {
  if (bananaContract.signer) {
    try {
      const tx = await bananaContract.compound(ref);
      return await tx.wait();
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    return false;
  }
};

export const createRef = async (bananaContract) => {
  if (bananaContract.signer) {
    try {
      const tx = await bananaContract.createReferralCode();
      return await tx.wait();
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    return false;
  }
};

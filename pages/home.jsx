import { useWeb3React } from "@web3-react/core";
import ConnectButton from "../components/connect";
import Modal from "../components/modal";

import { useSlowRefresh } from "../hooks/useRefresh";
import {
  claimVault,
  compoundVault,
  depositVault,
  useBanaStats,
} from "../hooks/banana";
import { BigNumber, ethers } from "ethers";

import { useEffect, useState } from "react";
import { useBananaContract } from "../hooks/useContract";
import { FaSquareXTwitter } from "react-icons/fa6";
import { IoMdAlert } from "react-icons/io";
import { FaFileContract } from "react-icons/fa";
import punk from "../src/assets/punk.png";

import { CopyToClipboard } from "react-copy-to-clipboard";

const CHAIND_ID = 137;
export const Home = () => {
  const { account, chainId, library } = useWeb3React();
  const [update, setUpdate] = useState(0);

  const refresh = useSlowRefresh();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const bananaContract = useBananaContract(library);

  const { tvl, tvlDollars, miners, pendingRewards } = useBanaStats(
    library,
    account,
    refresh,
    chainId,
    update,
    bananaContract
  );
  const [amountToDeposit, setAmountToDeposit] = useState(0);
  const [balanceBNB, setBalanceBNB] = useState(BigNumber.from(0));

  useEffect(() => {
    const fetch = async () => {
      const balanceB = await library.getBalance(account);
      setBalanceBNB(balanceB);
    };
    if (account) fetch();
  }, [update, account]);

  const setamount = (e) => {
    let amount = e.target.value;
    if (amount == "") amount = "0";

    setAmountToDeposit(amount);
  };
  const deposit = async () => {
    if (account && amountToDeposit > 0 && chainId == CHAIND_ID) {
      let params = new URL(document.location).searchParams;
      let ref = params.get("ref");
      const checkRef = ref ?? account;
      const tx = await depositVault(
        bananaContract,
        ethers.utils.parseEther(amountToDeposit.toString()),
        checkRef
      );
      if (tx) {
        setUpdate(update + 1);
      } else {
        console.log("error");
      }
    }
  };

  const compound = async () => {
    if (account) {
      let params = new URL(document.location).searchParams;
      let ref = params.get("ref");
      const checkRef = ref ?? account;
      const tx = await compoundVault(bananaContract, checkRef);
      if (tx) {
        setUpdate(update + 1);
      } else {
        console.log("error");
      }
    }
  };

  const claim = async () => {
    if (account) {
      const tx = await claimVault(bananaContract);
      if (tx) {
        setUpdate(update + 1);
      } else {
        console.log("error");
      }
    }
  };

  return (
    <>
      <div className="bg-dapp">
        <div className="container-global">
          <div className="container-info">
            <img src={punk} className="img-punk" />

            <h1>MATICraft: Forge Your Digital Fortune</h1>
            <h2>From mines to MATIC, fast!</h2>
          </div>
          <div className="container-contract-verified">
            <p>Contract audited and verified! 🎉 🍸</p>
          </div>
          <div className="container-data">
            <div className="card-data">
              <>
                <p>
                  #1 - BUY your miners: Start by using your MATIC to purchase
                  your miners.
                </p>
                <p>
                  #2 - COMPOUND: To maximize your earnings, click on the
                  "COMPOUND" button. This action will automatically reinvest
                  your MATIC rewards back into your miners.
                </p>
                <p>
                  #3 - CLAIM REWARDS: This will transfer your accumulated MATIC
                  rewards directly into your wallet.
                </p>

                <p>
                  The key to maximizing your rewards lies in the quantity of
                  MATIC you hold and how frequently you compound them. The more
                  you accumulate and the more often you reinvest your rewards,
                  the greater the potential for earning more MATIC rewards.
                </p>
                <div className="container-common">
                  <div className="container-data-contract">
                    <div className="banana-data">
                      <p>TVL</p>
                      <p>{tvlDollars} $</p>
                    </div>
                    <div className="banana-data">
                      <p>CONTRACT</p>
                      <p>
                        {parseFloat(ethers.utils.formatEther(tvl)).toFixed(2)}{" "}
                        MATIC
                      </p>
                    </div>
                    <div className="banana-data">
                      <p>MINERS</p>
                      <p>{miners}</p>
                    </div>
                    <div className="banana-data">
                      <p>WALLET</p>
                      <p>
                        {balanceBNB.gt(0)
                          ? parseFloat(
                              ethers.utils.formatEther(balanceBNB)
                            ).toFixed(2)
                          : "0"}{" "}
                        MATIC
                      </p>
                    </div>
                    {/*  <div className="banana-data">
                        <p>BANANA PRICE</p>
                        <p>
                          {accTokenPerShare.gt(0)
                            ? parseInt(
                                accTokenPerShare
                                  .div(BigNumber.from(1000000))
                                  .toString()
                              )
                            : "0"}
                        </p>
                      </div> */}
                    {account ? (
                      chainId != CHAIND_ID ? (
                        <ConnectButton />
                      ) : (
                        <>
                          <div className="container-buy-matic">
                            <input
                              type="number"
                              step="0.2"
                              className="form-control "
                              placeholder="0 MATIC"
                              onChange={(e) => setamount(e)}
                              value={amountToDeposit}
                            ></input>
                            <a className="my-button" href="#" onClick={deposit}>
                              Buy Miners
                            </a>
                          </div>
                          <div className="banana-data">
                            <p>REWARDS</p>
                            <p>
                              {ethers.utils.formatEther(pendingRewards)} MATIC
                            </p>
                          </div>
                          <div className="container-claim-compound">
                            <a
                              className="my-button"
                              href="#"
                              onClick={compound}
                            >
                              Compound
                            </a>

                            <a className="my-button" href="#" onClick={claim}>
                              Claim
                            </a>
                          </div>
                        </>
                      )
                    ) : (
                      <ConnectButton />
                    )}
                  </div>
                </div>
              </>
              <div className="container-common">
                <div className="container-data-contract stats-contract">
                  <div className="banana-data">
                    <p>Daily return</p>
                    <p>10%</p>
                  </div>
                  <div className="banana-data">
                    <p>A.P.R</p>
                    <p> 2900%</p>
                  </div>
                  <div className="banana-data">
                    <p>Fee</p>
                    <p>5 %</p>
                  </div>
                </div>
              </div>
              {account ? (
                <div className="container-common">
                  <div className="container-referral container-data-contract">
                    <p>REFERRAL LINK Earn 12% of MATIC</p>
                    <CopyToClipboard
                      text={`${window.location.origin}?ref=${account}`}
                      onCopy={(text) => alert(`copied: ${text}`)}
                      className="referral-link"
                    >
                      <button>
                        {window.location.origin}?ref={account}
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="container-footer">
              <div className="icons">
                <a
                  href="https://twitter.com/mybananatree"
                  target="_blank"
                  rel="noreferrer"
                  width="180"
                >
                  <FaSquareXTwitter size="3em" color="white" />
                </a>
              </div>
              <div className="icons" onClick={handleOpen}>
                <IoMdAlert size="3em" color="white" />
              </div>
              <div className="icons">
                <a
                  href="https://t.me/mybananatree"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaFileContract size="3em" color="white" />
                </a>
              </div>
            </div>
            <Modal isOpen={open} onClose={handleClose}>
              <>
                <h1>Disclaimer: Enter at Your Own Risk</h1>
                <p>
                  Welcome to "Literally a Ponzi" – the blatantly transparent
                  Ponzi Scheme on the blockchain. Here's the deal, and we're not
                  sugarcoating it: if you choose to participate, you're diving
                  headfirst into a satirical abyss of crypto degeneracy. This is
                  a Ponzi Scheme, and by participating, you fully acknowledge
                  and accept the risks involved. We're laying it out as clearly
                  as we can: what you do here is on you. If you decide to
                  deposit, recruit, or engage in any way, remember, you're
                  playing with fire. The rules are straightforward – early birds
                  might get worms, but when the music stops, someone's left
                  standing without a chair. To be blunt, you could lose
                  everything. We're not here to babysit or hold hands. Think of
                  this as a wild ride at an amusement park with a sign saying,
                  "Ride at Your Own Risk." Except, in this case, the risk isn’t
                  a dizzy spell but a potentially empty wallet. Don't say we
                  didn't warn you. Your participation, your problem. Now, if
                  you're still here, ready to embrace the chaos of Ponzinomics
                  101, buckle up – and don't say we didn't warn you. Again.
                  Don't send us money. Don't send us angry emails. Don't
                  complain on Twitter. Don't blame us for your losses.You've
                  been warned.
                </p>
              </>
            </Modal>{" "}
          </div>
        </div>
      </div>
    </>
  );
};

/* Disclaimer: Enter at Your Own Risk
Welcome to "Literally a Ponzi" – the blatantly transparent Ponzi Scheme on the blockchain. Here's the deal, and we're not sugarcoating it: if you choose to participate, you're diving headfirst into a satirical abyss of crypto degeneracy. This is a Ponzi Scheme, and by participating, you fully acknowledge and accept the risks involved.

We're laying it out as clearly as we can: what you do here is on you. If you decide to deposit, recruit, or engage in any way, remember, you're playing with fire. The rules are straightforward – early birds might get worms, but when the music stops, someone's left standing without a chair.

To be blunt, you could lose everything. We're not here to babysit or hold hands. Think of this as a wild ride at an amusement park with a sign saying, "Ride at Your Own Risk." Except, in this case, the risk isn’t a dizzy spell but a potentially empty wallet.

Don't say we didn't warn you. Your participation, your problem. Now, if you're still here, ready to embrace the chaos of Ponzinomics 101, buckle up – and don't say we didn't warn you.

Again. Don't send us money. Don't send us angry emails. Don't complain on Twitter. Don't blame us for your losses. Don't be a baby. You've been warned. */

/* The rules are simple: the first folks to deposit get a slice of every subsequent investment. But here's the twist - all 'funds' are locked for 30 days from deposit. Pull in new recruits with your referral link, and you'll skim off the top of their deposits too, all the way down the chain. */

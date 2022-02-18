import React, { useState } from "react";
import { useEthers } from "@usedapp/core";
import { address } from "../contracts";
import nftabi from "../contracts/NFT.json";
import { ethers } from "ethers";
import banner from "../banner.png";
import { notifyMintSuccess, notifyError, notifyNetwork } from "../toast";
import {
  useBalanceOf,
  useTotalSupply,
  useMaxSupply,
  useCost,
  useNftPerAddressLimit,
  useIsWhitelisted,
  useOnlyWhitelisted,
  useWeiCost,
} from "../hooks";

const Minter = () => {
  const { account, activateBrowserWallet } = useEthers();
  const [minting, setMinting] = useState(false);
  const totalSupply = useTotalSupply();
  const maxSupply = useMaxSupply();
  const cost = useCost();
  const weiCost = useWeiCost();
  const nftbalance = useBalanceOf(account);
  const [amount, setAmount] = useState(1);
  const onlyWhitelisted = useOnlyWhitelisted();
  const isWhitelisted = useIsWhitelisted(account);
  const nftLimit = useNftPerAddressLimit();

  const increase = () => {
    if (amount < 10) {
      setAmount(amount + 1);
    }
  };

  const decrease = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  const nftInterface = new ethers.utils.Interface(nftabi);

  const onError = () => {
    notifyNetwork();
  };

  async function handleMint() {
    try {
      setMinting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const txCost = Number(weiCost) * amount;
      let nftcontract = new ethers.Contract(address, nftInterface, signer);
      let transaction = await nftcontract.mint(amount, {
        value: txCost.toString(),
      });
      await transaction.wait();
      setMinting(false);
      setAmount(1);
      notifyMintSuccess();
    } catch (error) {
      notifyError();
      setAmount(1);
      console.log(error);
      setMinting(false);
    }
  }

  return (
    <>
      <div className="minter-main">
        <img src={banner} className="banner" alt="banner" />

        <h1 className="minter-h1">Mint Your Dominant Eagle</h1>
        {onlyWhitelisted ? (
          <div style={{ marginTop: 30, padding: 10 }}>
            <h3 className="minter-h1">Minting Starts On 19 FEB 4 PM UTC</h3>
          </div>
        ) : null}

        {totalSupply < 777 ? (
          <div className="minting-section">
            {account ? (
              <div className="minting-section">
                <button className="connect btn btn-gradient-blue">{`${account.slice(
                  0,
                  6
                )}...${account.slice(-6)}`}</button>

                {onlyWhitelisted ? (
                  <>
                    <>
                      {isWhitelisted ? (
                        <>
                          {nftbalance < nftLimit ? (
                            <div>
                              <button
                                className="btn btn-round amount  btn-gradient-blue"
                                onClick={() => decrease()}
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleMint()}
                                className="btn mint  btn-gradient-blue"
                              >
                                {minting ? "Please Wait" : `Mint ${amount}`}
                              </button>
                              <button
                                className="btn btn-round amount  btn-gradient-blue"
                                onClick={() => increase()}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button className="btn mint  btn-gradient-blue">
                              You have reached your mint limit
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button className="btn mint  btn-gradient-blue">
                            Minting Starts On FEB 19 at 4 PM UTC
                          </button>
                        </>
                      )}
                    </>
                  </>
                ) : (
                  <>
                    <div>
                      <button
                        className="btn btn-round amount  btn-gradient-blue"
                        onClick={() => decrease()}
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleMint()}
                        className="btn mint  btn-gradient-blue"
                      >
                        {minting ? "Please Wait" : `Mint ${amount}`}
                      </button>
                      <button
                        className="btn btn-round amount  btn-gradient-blue"
                        onClick={() => increase()}
                      >
                        +
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => activateBrowserWallet(onError)}
                  className="connect btn btn-gradient-blue"
                >
                  Connect Metamask
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="minting-section">
            <button className="connect btn btn-gradient-blue">
              Sale Ended
            </button>
          </div>
        )}

        {totalSupply < 777 ? (
          <div className="minter-status">
            <div className="minter-status-card">
              <h6>Status</h6>
              <h2>Live</h2>
            </div>
            <div className="vl"></div>
            <div className="minter-status-card">
              <h6>Mint Price</h6>
              <h2>0.15 ETH</h2>
            </div>
            <div className="vl"></div>
            {account ? (
              <>
                {onlyWhitelisted ? (
                  <>
                    {isWhitelisted ? (
                      <div className="minter-status-card">
                        <h6>Your Mint</h6>
                        <h2>
                          {nftbalance}/{nftLimit}
                        </h2>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
            <div className="vl"></div>
            {onlyWhitelisted ? null : (
              <div className="minter-status-card">
                <h6>To Be Minted</h6>
                <h2>{777 - totalSupply}</h2>
              </div>
            )}
          </div>
        ) : (
          <div className="minter-status">
            <div className="minter-status-card">
              <h6>Status</h6>
              <h2>Ended</h2>
            </div>
            <div className="vl"></div>
            <div className="minter-status-card">
              <h6>Mint Price</h6>
              <h2>0.15 ETH</h2>
            </div>
            <div className="vl"></div>
            {onlyWhitelisted ? null : (
              <div className="minter-status-card">
                <h6>To Be Minted</h6>
                <h2>
                  {maxSupply - totalSupply}/{777}
                </h2>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Minter;

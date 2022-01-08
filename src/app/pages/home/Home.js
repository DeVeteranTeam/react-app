import React, { useContext, useEffect } from 'react';
import './Home.scss';
import Board from '../../components/board/Board';
import Button from '../../components/button/Button';
import { withRouter } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import HorizontalLine from '../../components/horizontal-line/HorizontalLine';
import { ethers } from 'ethers'
import { connectWallet, getCurrentWalletConnected } from './../../../helpers/interact'


function Home({ history, setMsg }) {
  const { setWalletAddress, walletAddress } = useContext(AppContext);

  const onClickConnectWallet = async () => {
    const walletResponse = await connectWallet()
    setMsg(walletResponse.status)
    setWalletAddress(walletResponse.address)
  }
  const defaultFirstP = <p>
    Invite your friends and play some chess online! Feel free to
    <b onClick={() => onClickConnectWallet() }> Connect Wallet</b>
  </p>

  const authFirstP = <p>
      Thank you for signing in { 'wallet address' }!
      Feeling ready to play some chess? No need to wait any further!
      Explore available rooms or create one yourself. And remember to have fun!
  </p>

  return (
        <div className='HomePage'>
            <div className='hero-section'>
                <h1>FREE ONLINE CHESS</h1>
                <h2>PLAY EASILY WITH ANYONE YOU CHOOSE</h2>
                { walletAddress ? authFirstP : defaultFirstP }
                <div>
                    <Button
                        click={() => walletAddress ? history.push('/multiplayer') : onClickConnectWallet() }
                        color='primary'>{ walletAddress ? <span className='wallet-address'>{walletAddress}</span> : 'Connect Wallet' }</Button>
                </div>
            </div>
            <Board playable={ false } setMsg={setMsg} />
            <HorizontalLine />
        </div>
    )
}

export default withRouter(Home);

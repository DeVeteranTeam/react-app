import './App.scss';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './app/pages/home/Home';
import Local from './app/pages/local/Local';
import SideMenu from './app/components/side-menu/SideMenu';
import Multiplayer from './app/pages/multiplayer/Multiplayer';
import GameContextProvider from './app/context/GameContext';
import { AppContext } from './app/context/AppContext';
import { useContext, useState,useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const { walletAddress, setWalletAddress } = useContext(AppContext);
  const [ msg, setMsg ] = useState('')
  const overlay = useRef(null);

  const notify = () => toast.info(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  useEffect(() =>{
    if(msg) notify()
    setMsg('')
  }, [msg])
  return (
    <GameContextProvider>
      <div className="App">
        <SideMenu />
        <div className='container'>
          <Switch>
            <Route
              path='/'
              exact
              component={() => <Home setMsg={setMsg}/>}
            />
            <Route path='/local' exact render={ props => {
              if(walletAddress)
                {
                  return <Local setMsg={setMsg}/>
                } else {
                  return <Redirect
                    to={{ pathname: "/", state: { from: props.location } }}
                  />
                }
            }}/>
            <Route path='/multiplayer' exact render={ props => {
              if(walletAddress)
                {
                  return <Multiplayer setMsg={setMsg}/>
                } else {
                  return <Redirect
                    to={{ pathname: "/", state: { from: props.location } }}
                  />
                }
            }}/>
          </Switch>
          <div className='authOverlay' ref={ overlay }></div>
        </div>
      </div>
      <ToastContainer />
    </GameContextProvider>
  );
}

export default App;

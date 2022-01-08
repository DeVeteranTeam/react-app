import React, { useState } from 'react';

export const AppContext = React.createContext({
    walletAddress: '',
    setWalletAddress: () => {},
});

const AppContextProvider = (props)=>{
    const [walletAddress, setWalletAddress] = useState('');
    return(
        <AppContext.Provider value={{
            walletAddress: walletAddress, setWalletAddress: setWalletAddress,
         }}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;

import React, { useContext, useRef } from 'react';
import './SideMenu.scss';
import logo from '../../../assets/icons/logo.png';
import HorizontalLine from '../horizontal-line/HorizontalLine';
import Button from '../button/Button';
import { withRouter } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Auth from '../auth/Auth';

function SideMenu({ history }) {
    const {
        isSigningIn, isSigningUp,
        setIsSigningIn, setIsSigningUp,
        isAuth, setIsAuth,
        user, setUser,
    } = useContext(AppContext);
    const sectionRef = useRef(null);

    function signOut() {
        sectionRef.current.classList.toggle('hidden');
        setTimeout(() => {
            sectionRef.current.classList.toggle('hidden');
            localStorage.clear();
            setIsAuth(false);
            setUser(null);
        }, 400);
    }

    const signUpParagraph = <p onClick={() => setIsSigningUp(true) }>Don’t have an account? Sign up!</p>;
    const signOutParagraph = <p onClick={ signOut }>Leave account? Sign out!</p>;

    return (
        <div className='SideMenu'>
            <img src={ logo } alt='logo' onClick={ ()=> history.push('/') } style={{ cursor: 'pointer' }}/>
            <HorizontalLine />
            <section className={ isSigningIn || isSigningUp ? 'hidden' : ''} ref={ sectionRef }>
                <h3>PLAY AS { isAuth ? user.displayName.toUpperCase() : 'GUEST' }</h3>
                <Button click={() => history.push('/local') }>LOCAL MULTIPLAYER</Button>
                <Button click={() => history.push('/multiplayer') }>ONLINE MULTIPLAYER</Button>
            </section>
        </div>
    )
}

export default withRouter(SideMenu);

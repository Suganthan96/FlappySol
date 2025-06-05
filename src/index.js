import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store, game, states, rungame, birdjump } from './store/store';
import { updateFrame } from './store/store';

// Initialize game state
game.currentstate = states.Splash;

// Event handler for mouse clicks
function onpress(evt) {
    // Check if click is on any wallet-related elements
    const walletButton = document.querySelector('.wallet-adapter-button');
    const walletModal = document.querySelector('.wallet-adapter-modal');
    const walletOptions = document.querySelector('.wallet-adapter-modal-wrapper');
    const walletList = document.querySelector('.wallet-adapter-modal-list');
    const walletListItem = document.querySelector('.wallet-adapter-modal-list-more');
    const walletDisconnect = document.querySelector('.wallet-adapter-modal-button');
    const walletListItemButton = document.querySelector('.wallet-adapter-modal-list-item');
    
    // Check if any wallet element is being interacted with
    const isWalletInteraction = 
        (walletButton && walletButton.contains(evt.target)) || 
        (walletModal && walletModal.contains(evt.target)) ||
        (walletOptions && walletOptions.contains(evt.target)) ||
        (walletList && walletList.contains(evt.target)) ||
        (walletListItem && walletListItem.contains(evt.target)) ||
        (walletDisconnect && walletDisconnect.contains(evt.target)) ||
        (walletListItemButton && walletListItemButton.contains(evt.target)) ||
        // Check if wallet modal is visible
        (document.querySelector('.wallet-adapter-modal')?.style.display === 'flex');

    if (isWalletInteraction) {
        console.log('Wallet interaction detected, preventing game action');
        return; // Ignore clicks on any wallet elements
    }

    // Check if wallet is connected
    const isWalletConnected = document.querySelector('.wallet-adapter-button-trigger')?.textContent !== 'Select Wallet';
    if (!isWalletConnected) {
        console.log('Wallet not connected, preventing game action');
        return; // Prevent game actions if wallet is not connected
    }

    switch (game.currentstate) {
        case states.Splash:
            rungame();
            birdjump(store.bird);
            break;
        case states.Game:
            birdjump(store.bird);
            break;
        case states.Score:
            break;
        default:
            break;
    }
}

// Add event listener for mouse clicks
document.addEventListener('mousedown', onpress);

ReactDOM.render(
    <React.StrictMode>
        <App store={store} game={game} states={states} updateFrame={updateFrame} />
    </React.StrictMode>,
    document.getElementById('root')
);
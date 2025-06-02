import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { store, game, rungame, birdjump } from './store/store';
import { states } from './store/states';

// Initialize game state
game.currentstate = states.Splash;

// Event handler for mouse clicks
function onpress(evt) {
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
        <App store={store} game={game} />
    </React.StrictMode>,
    document.getElementById('root')
);

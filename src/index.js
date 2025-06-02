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

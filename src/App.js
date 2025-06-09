import React, { useMemo } from 'react';
//import logo from './logo.svg';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  NightlyWalletAdapter,
  TokenPocketWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import SolanaHighScore from './components/SolanaHighScore';
import './App.css';
import {bg,fg, bird0, bird1, bird2, pipeN, pipeS, gameover, _ok_, splash, ready, tap} from './common/Sprite';
import {width, height} from './common/common';
import { observer} from 'mobx-react';
import {rungame, game, togglePause, store, states} from './store/store';
import startBtn from './res/start.png';
import pauseBtn from './res/pause.png';
import resumeBtn from './res/resume.png';
import zero from './res/numbers/zero.png';
import one from './res/numbers/one.png';
import two from './res/numbers/two.png';
import three from './res/numbers/three.png';
import four from './res/numbers/four.png';
import five from './res/numbers/five.png';
import six from './res/numbers/six.png';
import seven from './res/numbers/seven.png';
import eight from './res/numbers/eight.png';
import nine from './res/numbers/nine.png';
import titleImg from './res/title.png';
import normalcoin from './res/normalcoin.png';
import bronzecoin from './res/bronzecoin.png';
import silvercoin from './res/silvercoin.png';
import goldcoin from './res/goldcoin.png';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Configure wallets outside of component
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new WalletConnectWalletAdapter({
    network,
    options: {
      relayUrl: 'wss://relay.walletconnect.com',
      projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect
      metadata: {
        name: 'Flappy Bird Game',
        description: 'Flappy Bird Game on Solana',
        url: 'https://your-game-url.com',
        icons: ['https://your-game-url.com/icon.png']
      }
    }
  }),
  new TrustWalletAdapter(),
];

const SpriteWrapper = observer(class SpriteWrapper extends React.Component {
  render() {
    const gameSprite = this.props.gameSprite;
    const rotate = 'rotate('+ gameSprite.rotation +'rad)'
    const translate = 'translate(' + gameSprite.cx + 'px,' + gameSprite.cy + 'px)'
    const ctrans = (gameSprite.rotation == null) ? translate : translate + ' ' + rotate;
    const onClickHandler = (this.props.onClickHandler) == null ? null : this.props.onClickHandler;
    var style = {
      transform: ctrans,
      position: 'absolute'
    }

    return (
      <div style={style} onClick={onClickHandler}>
        {this.props.children}
      </div>
    )
  }
})

const Bg = observer(
  class Bg extends React.Component {
    render() {
      return <SpriteWrapper gameSprite={this.props.bg}> {bg} </SpriteWrapper>;
    }
  }
)

const Fg = observer(
  class Fg extends React.Component {
    render() {
      return <SpriteWrapper gameSprite={this.props.fg}> {fg} </SpriteWrapper>;
    }
  }
)

export const Bird = observer(
  class Bird extends React.Component {
    render() {
      let wbird;
      switch(this.props.bird.frame) {
        case 1:
        case 3:
          wbird = bird1
          break
        case 2:
          wbird = bird2
          break
        case 0:
        default:
          wbird = bird0
          break
      }

      return <SpriteWrapper gameSprite={this.props.bird}> {wbird} </SpriteWrapper>;
    }
  }
)

const Pipe = observer(
  class Pipe extends React.Component {
    render() {
      let wpipe;
      switch(this.props.pipe.type) {
        default:
        case "N":
          wpipe = pipeN
          break
        case "S":
          wpipe = pipeS
          break
      }

      return <SpriteWrapper gameSprite={this.props.pipe}> {wpipe} </SpriteWrapper>;
    }
  }
)

export const OK = observer(
  class OK extends React.Component {
    render() {
      return (
        <div className="ok-button-absolute" onClick={rungame}>
          {_ok_}
        </div>
      );
    }
  }
);

export const Splash = observer(
  class Splash extends React.Component {
    render() {
      return <SpriteWrapper gameSprite={{cx: width/2 - 59, cy: height-300}}> {splash} </SpriteWrapper>;
    }
  }
)

const Title = () => (
  <div style={{
    marginTop: -450,
    marginLeft:-0.5,
    marginRight:-60,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'auto',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 9999
  }}>
    <img src={titleImg} alt="Flappy Bird" style={{width: 4300, height: 1200}} />
  </div>
);

const StartButton = () => {
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);

  // Check wallet connection status
  React.useEffect(() => {
    const checkWalletConnection = () => {
      const connected = document.querySelector('.wallet-adapter-button-trigger')?.textContent !== 'Select Wallet';
      setIsWalletConnected(connected);
    };

    // Check initially
    checkWalletConnection();

    // Set up an interval to check periodically
    const interval = setInterval(checkWalletConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div 
        style={{
          marginTop: 190,
          marginLeft: 220,
          marginBottom: -240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          pointerEvents: 'auto',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1000
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (isWalletConnected) {
            rungame();
          }
        }}
      >
        {!isWalletConnected && (
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            marginBottom: '10px'
          }}>
            Connect Wallet to Start
          </div>
        )}
        <img 
          src={startBtn} 
          alt="Start" 
          style={{
            width: 80, 
            height: 'auto',
            pointerEvents: 'auto',
            opacity: isWalletConnected ? 1 : 0.5
          }} 
        />
      </div>
    </>
  );
};

export const ReadyAndTap = observer(
  class ReadyAndTap extends React.Component {
    render() {
      return (
        <div style={{
          position: 'absolute',
          left: '22%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          <div style={{transform: 'scale(0.8)'}}>
            <SpriteWrapper gameSprite={{cx: 400/2 - 143.25, cy: -40}}>{ready}</SpriteWrapper>
          </div>
          <div style={{height: 16}} />
          <div style={{transform: 'scale(0.8)'}}>
            <SpriteWrapper gameSprite={{cx: 400/2 - 120.25, cy: 20}}>{tap}</SpriteWrapper>
          </div>
          <StartButton />
        </div>
      );
    }
  }
);

const ScoreDisplay = observer(({ score }) => {
  const digits = String(score).split('').map(Number);
  const numberImages = [zero, one, two, three, four, five, six, seven, eight, nine];
  
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 9999,
      background: 'transparent',
      pointerEvents: 'none',
    }}>
      {digits.map((d, i) => (
        <img 
          key={i} 
          src={numberImages[d]} 
          alt={d.toString()} 
          style={{
            width: '24px',
            height: '36px',
            marginLeft: i === 0 ? 0 : '2px'
          }}
        />
      ))}
    </div>
  );
});

const PauseButton = observer(() => {
  return (
    <div style={{
      position: 'absolute',
      top: 5,
      left: 5,
      zIndex: 10000,
      cursor: 'pointer',
      pointerEvents: 'auto',
      padding: '10px',
      borderRadius: '50%',
    }}
    onClick={(e) => {
      e.stopPropagation();
      if (game.currentstate === states.Game) {
        togglePause();
      }
    }}>
      <img 
        src={game.isPaused ? resumeBtn : pauseBtn} 
        alt={game.isPaused ? "Resume" : "Pause"} 
        style={{width: 40, height: 'auto'}} 
      />
    </div>
  );
});

const CoinDisplay = observer(({ score }) => {
  let coinImage = null;
  
  if (score >= 30) {
    coinImage = goldcoin;
  } else if (score >= 20) {
    coinImage = silvercoin;
  } else if (score >= 10) {
    coinImage = bronzecoin;
  } else if (score >= 5) {
    coinImage = normalcoin;
  }

  if (!coinImage) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 70,
      right: 17,
      zIndex: 9999,
      background: 'transparent',
      pointerEvents: 'none',
    }}>
      <img 
        src={coinImage} 
        alt="Coin" 
        style={{
          width: '30px',
          height: '30px',
        }}
      />
    </div>
  );
});

const App = observer(class App extends React.Component {
  componentDidMount() {
    this.req = window.requestAnimationFrame(this.appUpdateFrame);
  }

  appUpdateFrame = () => {
    this.props.updateFrame();
    this.req = window.requestAnimationFrame(this.appUpdateFrame);
  }

  render() {
    const {bgs, fgs, bird, pipes} = this.props.store;
    const { currentstate } = this.props.game;

    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
              <SolanaHighScore 
                currentScore={this.props.store.score} 
                gameState={currentstate === states.Score ? 'GAME_OVER' : 'PLAYING'}
              />
              <div style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#70C5CF"
              }}>
                <div className="background-container" />
                
                <div style={{
                  position: "relative",
                  width: 400,
                  height: 650,
                  backgroundColor: "#70C5CF",
                  border: "3px solid #FFD700",
                  borderRadius: "15px",
                  overflow: "hidden"
                }}>
                  <div className="App" id="fakingcanvas" style={{top: 0}}>
                    {bgs.map((bg) => (<Bg bg={bg} key={bg.id} />))}
                    {pipes.map((pipe) => (<Pipe pipe={pipe} key={pipe.id} />))}
                    <Bird bird={bird} />
                    {(currentstate === states.Splash) ? <Title /> : null}
                    {(currentstate === states.Splash) ? <Splash /> : null}
                    {(currentstate === states.Splash) ? <ReadyAndTap /> : null}
                    {fgs.map((fg) => (<Fg fg={fg} key={fg.id} />))}
                    {(currentstate === states.Game || currentstate === states.Score) ? 
                      <ScoreDisplay score={this.props.store.score} /> : null}
                    {(currentstate === states.Game || currentstate === states.Score) ? 
                      <CoinDisplay score={this.props.store.score} /> : null}
                    {currentstate === states.Game ? <PauseButton /> : null}
                  </div>
                </div>

                {currentstate === states.Score ? (
                  <div className="gameover-ok-container">
                    <div className="gameover-image">{gameover}</div>
                    <div className="ok-button" onClick={rungame}>{_ok_}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
})

export default App;

import { bg, fg, bird, pipe } from './asset';
import { height } from '../common/common';
import { bg_h, bg_w, fg_h, fg_w, pipe_h, pipe_w, bird_h, bird_w} from '../common/Sprite';
import { action, observable, configure } from 'mobx';

// Configure MobX to enforce actions
configure({ enforceActions: 'observed' });

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

const bg1 = new bg(guid(), 0, height - bg_h);
const bg2 = new bg(guid(), bg_w, height - bg_h);
const fg1 = new fg(guid(), 0, height - fg_h);
const fg2 = new fg(guid(), fg_w, height - fg_h);

export const states = {
  Splash: 0,
  Game: 1,
  Score: 2
};

// Game state
export const game = observable({
  currentstate: states.Splash,
  isPaused: false
});

export const store = observable({
  bird: new bird(guid(), 60, 0),
  fgpos: 0,
  frames: 1,
  bgs: [bg1, bg2],
  fgs: [fg1, fg2],
  pipes: [],
  score: 0,
  highestScore: 0
});

const updateBird = action((bird) => {
  bird.frame += store.frames % 10 === 0 ? 1 : 0;
  bird.frame %= bird.animation.length;

  if (game.currentstate === states.Splash) {
    bird.cy = height - 280 + 5 * Math.cos(store.frames / 10);
    bird.rotation = 0;
  } else {
    bird.velocity += bird.gravity;
    bird.cy += bird.velocity;

    if (bird.cy >= height - fg_h - 10) {
      bird.cy = height - fg_h - 10;
      if (game.currentstate === states.Game) {
        game.currentstate = states.Score;
      }
      bird.velocity = bird._jump;
    }

    if (bird.velocity >= bird._jump) {
      bird.frame = 1;
      bird.rotation = Math.min(Math.PI / 2, bird.rotation + 0.3);
    } else {
      bird.rotation = -0.3;
    }
  }
});

const updatePipe = action(() => {
  if (store.frames % 100 === 0) {
    const _y = height - (pipe_h + fg_h + 120 + 200 * Math.random());
    store.pipes.push(
      new pipe(guid(), pipe_h, _y, "S"),
      new pipe(guid(), pipe_h, _y + 100 + pipe_h, "N")
    );
  }

  store.pipes.forEach((p, i) => {
    const bird = store.bird;
    const cx = Math.min(Math.max(bird.cx + bird_w / 2, p.cx), p.cx + pipe_w);
    const cy = Math.min(Math.max(bird.cy + bird_h / 2, p.cy), p.cy + pipe_h);

    const dx = bird.cx + bird_w / 2 - cx;
    const dy = bird.cy + bird_h / 2 - cy;
    const d1 = dx * dx + dy * dy;
    const r = bird.radius * bird.radius;

    if (r > d1) {
      game.currentstate = states.Score;
    }

    p.cx -= 2;
    if (p.cx < -pipe_w) {
      store.pipes.splice(0, 2);
      store.score += 1;
      if (store.score > store.highestScore) {
        store.highestScore = store.score;
      }
    }
  });
});

export const birdjump = action((bird) => {
  bird.velocity = -bird._jump;
});

export const rungame = action(() => {
  if (game.currentstate === states.Score) {
    store.pipes = [];
    game.currentstate = states.Splash;
  } else {
    store.bird = new bird(guid(), 60, 0);
    store.fgpos = 0;
    store.frames = 1;
    store.pipes = [];
    store.score = 0;
    game.currentstate = states.Game;
    game.isPaused = false;
  }
});

export const togglePause = action(() => {
  if (game.currentstate === states.Game) {
    game.isPaused = !game.isPaused;
  }
});

// Call to update frame
export const updateFrame = action(() => {
  if (game.isPaused) return;

  store.frames++;
  store.fgpos = (store.fgpos - 2) % 14;
  fg1.cx = store.fgpos;
  fg2.cx = store.fgpos + fg_w;

  updateBird(store.bird);

  if (game.currentstate === states.Game) {
    updatePipe();
  }
});

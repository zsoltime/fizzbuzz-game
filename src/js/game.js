const Game = (function() {
  'use strict';
  const shuffleAtLevel = 15;
  const fadingTime = 1000;
  let levelTime = 8000;
  let min = 10;
  let max = 50;
  let target = 0;
  let solution = '';
  let lives = 3;
  let level = 1;
  let topLevel = 0;
  let score = 0;
  let topScore = 0;
  let timeoutId = 0;
  let savedTimes = 0;
  let startedAt = 0;

  function init() {
    resetGame();
    generateNumber();
    render();
  }

  function render() {
    dom.number.textContent = target;
    dom.level.textContent = level;
    dom.maxLevel.textContent = topLevel;
    dom.lives.textContent = lives;
    dom.score.textContent = score;
    dom.maxScore.textContent = topScore;
  }

  const dom = {
    splash: document.getElementsByClassName('splash')[0],
    game: document.getElementsByClassName('game')[0],
    start: document.getElementsByClassName('start')[0],
    number: document.getElementById('number'),
    timer: document.getElementsByClassName('timer')[0],
    options: document.getElementById('options'),
    level: document.getElementById('level'),
    maxLevel: document.getElementById('max-level'),
    score: document.getElementById('score'),
    maxScore: document.getElementById('max-score'),
    lives: document.getElementById('lives'),
    headers: document.getElementsByTagName('header')
  };

  dom.start.addEventListener('click', start);
  dom.options.addEventListener('click', checkAnswer);

  function saveHighestScores() {
    localStorage.setItem('g00ts', topScore);
    localStorage.setItem('g00tl', topLevel);
  }

  function getHighestScores() {
    topScore = localStorage.getItem('g00ts') || score;
    topLevel = localStorage.getItem('g00tl') || level;
  }

  function calculateScore() {
    // @todo should give some extra points for reaching higher levels
    let pointsForLevels = (level - 1) * 3;
    let pointsForSpeed = Math.round(savedTimes / 500);
    score = pointsForLevels + pointsForSpeed;
  }

  function resetGame() {
    max = 50;
    lives = 3;
    score = 0;
    level = 1;
    levelTime = 8000;
    savedTimes = 0;
    getHighestScores();
    resetList();
  }

  function checkAnswer(event) {
    if (event.target.id === solution) {
      resetCountdown();
      savedTimes += (levelTime - (new Date() - startedAt));

      updateClasses('correct', event.target);

      setTimeout(nextLevel, 500);
    }
    else {
      updateClasses('wrong', event.target);
      const dead = lostLife();
    }
  }

  function lostLife() {
    lives -= 1;
    render();

    if (lives === 0) {
      gameover();
      return false;
    }
    else {
      return true;
      // countdown();
    }
  }

  function updateClasses(result, target) {
      target.classList.add(result);
      dom.number.classList.add(result);
  }

  function resetClasses() {
    for (let i = 0; i < dom.options.children.length; i++) {
      dom.options.children[i].classList = '';
    }
    dom.number.classList = 'number';
  }

  function countdown() {
    startedAt = new Date();
    dom.timer.classList.add('active');
    timeoutId = setTimeout(function() {
      const dead = lostLife();

      resetCountdown();
      generateNumber();

      if (dead) {
        render();
        countdown();
      }
    }, levelTime);
  }

  function resetCountdown() {
    clearTimeout(timeoutId);
    newTimer();
  }

  function newTimer() {
    const oldTimer = document.body.removeChild(dom.timer);
    document.body.appendChild(oldTimer);

    dom.timer.classList.remove('active');
    dom.timer.style.animationDuration = levelTime + 'ms';
    dom.timer.style.animationTimingFunction = 'linear';
    dom.timer.style.animationFillMode = 'forwards';
  }

  function shuffleList() {
    for (let i = dom.options.children.length; i >= 0; i--) {
      let newPlace = Math.random() * i | 0;
      dom.options.children[newPlace].style.order = '';
      dom.options.appendChild(dom.options.children[newPlace]);
    }
  }

  function resetList() {
    const btns = dom.options.children;

    for (let i = 0; i < btns.length; i++) {
      btns[i].style.order = btns[i].dataset.order;
    }
  }

  function generateNumber() {
    target = random(min, max);
    if (!(target % 15)) {
      solution = 'fizzbuzz';
    }
    else if (!(target % 3)) {
      solution = 'fizz';
    }
    else if (!(target % 5)) {
      solution = 'buzz';
    }
    else {
      solution = 'none';
    }
  }

  function start() {
    resetGame();
    const active = event.target.dataset.from;
    dom[active].classList.add('fade-out');
    setTimeout(function() {
      dom[active].classList.remove('fade-out', 'active');
      dom.game.classList.add('fade-in', 'active');
      render();
      setTimeout(function() {
        dom.game.classList.remove('fade-in');
        countdown();
      }, fadingTime);
    }, fadingTime);
  }

  function nextLevel() {
    resetClasses();
    resetCountdown();

    level += 1;

    if (level % 3 === 0) {
      max += 25;
    }

    if (level > shuffleAtLevel) {
      shuffleList();
    }

    if (level <= 60 && (level % 10 === 0)) {
      levelTime -= 1000;
    }

    generateNumber();
    render();
    countdown();
  }

  function gameover() {
    calculateScore();

    if (score > topScore) {
      // new high score
      topScore = score;
    }

    if (level > topLevel) {
      // new high level
      topLevel = level;
    }

    saveHighestScores();

    dom.headers[0].classList.add('hidden');
    dom.headers[1].classList.remove('hidden');
    dom.game.classList.add('fade-out');

    resetClasses();
    resetCountdown();
    generateNumber();

    setTimeout(function() {
      render();
      dom.game.classList.remove('fade-out', 'active');
      dom.splash.classList.add('fade-in', 'active');
      setTimeout(function() {
        dom.splash.classList.remove('fade-in');
      }, fadingTime);
    }, fadingTime);
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return {
    init: init
  }
})();

Game.init();

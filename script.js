class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/nature.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.mp3');
        this.matchSound = new Audio('Assets/Audio/match.mp3');
        this.victorySound = new Audio('Assets/Audio/win.mp3');
        this.gameOverSound = new Audio('Assets/Audio/fail.mp3');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    gameOver() {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
        document.querySelector('.overlay-text.visible .overlay-text-small').addEventListener('click', () => {
            resetGame();
        });
    }
    victory() {
        clearInterval(this.countdown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
        createFallingEffect('star'); // Add stars on victory
        document.getElementById('victory-text').querySelector('.overlay-text-small').addEventListener('click', () => {
            document.getElementById('victory-text').classList.remove('visible');
            resetGame();
        }, { once: true });

    }
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { // Fisher-Yates Shuffle Algorithm.
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex;
        }
    }
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    
    let startButton = document.getElementById('start-button');
    let timeSelect = document.getElementById('time-select');
    
    let game;
    function resetGame() {
        const gameSetup = document.querySelector('.game-setup');
        gameSetup.classList.remove('hidden');
        gameSetup.classList.add('visible');
        document.getElementById('game-over-text').classList.remove('visible');
        document.getElementById('victory-text').classList.remove('visible');
        // Reset the time select dropdown to default (optional)
        document.getElementById('time-select').selectedIndex = 0;
    
        // Clear any existing animations
        const animationContainer = document.querySelector('.animation-container');
        if (animationContainer) {
            animationContainer.innerHTML = '';
        }
        game = null;
    }

    startButton.addEventListener('click', () => {
        let selectedTime = parseInt(timeSelect.value);
        game = new MixOrMatch(selectedTime, cards);
        document.querySelector('.game-setup').style.display = 'none';
        game.startGame();
        startAnimation(); // Start falling animation on game start
    });
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (game) {
                game.flipCard(card);
            }
        });
    });
    

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
            startAnimation(); // Start falling animation on game start
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}

function createFallingEffect(type) {
    const container = document.querySelector('.animation-container');

    for (let i = 0; i < 30; i++) { // Number of elements
        const element = document.createElement('div');
        element.classList.add(type);

        // Randomize starting position, animation duration, and delay
        element.style.left = `${Math.random() * 100}vw`; // Random horizontal position
        element.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5-10 seconds duration
        element.style.animationDelay = `${Math.random() * 5}s`; // 0-5 seconds delay

        container.appendChild(element);

        // Remove element after animation ends
        setTimeout(() => container.removeChild(element), 10000); // Match animation duration
    }
}

function startAnimation() {
    createFallingEffect('leaf'); // Falling leaves
    createFallingEffect('star'); // Falling stars
}

function createFloatingElement(type, imagePath) {
    const element = document.createElement('div');
    element.className = type;
    element.style.backgroundImage = `url(${imagePath})`;
    element.style.position = 'absolute';
    element.style.width = '40px';
    element.style.height = '40px';
    element.style.top = '-50px';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.transition = 'transform 10s linear, opacity 10s';
    
    document.body.appendChild(element);
  
    setTimeout(() => {
      element.style.transform = `translateY(${window.innerHeight}px)`;
      element.style.opacity = '0';
    }, 100);
  
    setTimeout(() => element.remove(), 10000); // Clean up
  }
  
  // Generate random elements periodically
  setInterval(() => {
    createFloatingElement('leaf', 'Assets/Images/leaf.png');
    createFloatingElement('star', 'Assets/Images/star.png');
  }, 1000);
  
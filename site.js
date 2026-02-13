window.addEventListener('load', function() {
    // ========== ОСНОВНЫЕ ЭЛЕМЕНТЫ ==========
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    const sliderTrack = document.getElementById('sliderTrack');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const finalMessage = document.getElementById('finalMessage');
    const pauseBtn = document.getElementById('pauseBtn');
    const gameStartBtn = document.getElementById('gameStartBtn');
    const gameContainer = document.getElementById('gameContainer');
    const gameArea = document.getElementById('gameArea');
    const catcher = document.getElementById('catcher');
    const scoreEl = document.getElementById('score');
    const lives = document.querySelectorAll('.life');
    const exitGame = document.getElementById('exitGame');
    const bonusMessage = document.getElementById('bonusMessage');
    const closeBonus = document.getElementById('closeBonus');
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let currentSlide = 0;
    let autoPlay = true;
    let slideInterval;
    const totalSlides = slides.length;
    
    // Переменные игры
    let gameActive = false;
    let score = 0;
    let lives_count = 3;
    let gameInterval;
    let catcherX = 50;
    let combo = 0;
    let lastCatchTime = 0;
    let gameWon = false; // Флаг победы в игре
    
    // Для мобильных свайпов
    let touchStartX = 0;
    let touchStartY = 0;
    
    // ========== ТАЙМЕР ==========
    function updateTimer() {
        const now = new Date();
        const end = new Date(now.getFullYear(), 1, 14, 23, 59, 59);
        
        if (now > end) {
            end.setFullYear(end.getFullYear() + 1);
        }
        
        const diff = end - now;
        
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();
    
    // ========== СЛАЙДЕР ==========
    function goToSlide(index) {
        currentSlide = index;
        sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        
        // На последнем слайде показываем финальное сообщение И кнопку игры (если еще не победа)
        if (currentSlide === totalSlides - 1) {
            finalMessage.classList.add('visible');
            
            // Показываем кнопку игры, только если еще не победили
            if (!gameWon) {
                gameStartBtn.classList.remove('hidden');
            }
        } else {
            finalMessage.classList.remove('visible');
            // На других слайдах кнопку НЕ ПРЯЧЕМ, она остается видимой
            // Но если игра уже пройдена, то кнопка не показывается нигде
        }
    }
    
    // Обработчики для точек
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
        dot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
    });
    
    // Стрелки
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const prev = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(prev);
        });
        prevBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const prev = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(prev);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const next = (currentSlide + 1) % totalSlides;
            goToSlide(next);
        });
        nextBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const next = (currentSlide + 1) % totalSlides;
            goToSlide(next);
        });
    }
    
    function startAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            if (autoPlay) {
                const next = (currentSlide + 1) % totalSlides;
                goToSlide(next);
            }
        }, 4000);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            autoPlay = !autoPlay;
            pauseBtn.style.opacity = autoPlay ? '0.5' : '1';
        });
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            autoPlay = !autoPlay;
            pauseBtn.style.opacity = autoPlay ? '0.5' : '1';
        });
    }
    
    // Свайпы
    if (sliderTrack) {
        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        sliderTrack.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                if (diffX > 0 && currentSlide < totalSlides - 1) {
                    goToSlide(currentSlide + 1);
                    if (navigator.vibrate) navigator.vibrate(10);
                } else if (diffX < 0 && currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                    if (navigator.vibrate) navigator.vibrate(10);
                }
            }
        });
    }
    
    // ========== СТАРТОВЫЙ ЭКРАН ==========
    if (startScreen) {
        startScreen.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            startAutoPlay();
            setTimeout(() => goToSlide(0), 100);
            
            // Фейерверк при открытии
            for (let i = 0; i < 10; i++) {
                setTimeout(() => createFirework(), i * 100);
            }
        });
        
        startScreen.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            startAutoPlay();
            setTimeout(() => goToSlide(0), 100);
            
            for (let i = 0; i < 10; i++) {
                setTimeout(() => createFirework(), i * 100);
            }
        });
    }
    
    // ========== ИГРА ==========
    if (gameStartBtn) {
        gameStartBtn.addEventListener('click', () => {
            startGame();
        });
        gameStartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startGame();
        });
    }
    
    if (exitGame) {
        exitGame.addEventListener('click', () => {
            endGame();
        });
        exitGame.addEventListener('touchstart', (e) => {
            e.preventDefault();
            endGame();
        });
    }
    
    if (closeBonus) {
        closeBonus.addEventListener('click', () => {
            bonusMessage.classList.remove('visible');
        });
        closeBonus.addEventListener('touchstart', (e) => {
            e.preventDefault();
            bonusMessage.classList.remove('visible');
        });
    }
    
    function startGame() {
        gameActive = true;
        score = 0;
        lives_count = 3;
        combo = 0;
        updateScore();
        updateLives();
        
        gameArea.innerHTML = '';
        gameContainer.classList.remove('hidden');
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            if (gameActive) {
                createHeart();
            }
        }, 600);
        
        gameArea.addEventListener('touchmove', moveCatcherTouch, { passive: false });
        gameArea.addEventListener('mousemove', moveCatcher);
        
        gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    }
    
    function endGame() {
        gameActive = false;
        gameContainer.classList.add('hidden');
        clearInterval(gameInterval);
        gameArea.removeEventListener('touchmove', moveCatcherTouch);
        gameArea.removeEventListener('mousemove', moveCatcher);
    }
    
    function moveCatcher(e) {
        if (!gameActive) return;
        const rect = gameArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
        catcherX = (x / rect.width) * 100;
    }
    
    function moveCatcherTouch(e) {
        if (!gameActive) return;
        e.preventDefault();
        const rect = gameArea.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
        catcherX = (x / rect.width) * 100;
    }
    
    function createHeart() {
        if (!gameActive) return;
        
        const rand = Math.random();
        let type = 'good';
        let emoji = '❤️';
        let points = 1;
        
        if (rand < 0.1) {
            type = 'gold';
            emoji = '💛';
            points = 2;
        } else if (rand < 0.25) {
            type = 'bad';
            emoji = '💔';
            points = -1;
        }
        
        const heart = document.createElement('div');
        heart.className = 'heart-fall';
        heart.innerHTML = emoji;
        heart.style.left = Math.random() * 90 + '%';
        heart.style.top = '-50px';
        heart.style.animationDuration = Math.random() * 2 + 2 + 's';
        heart.setAttribute('data-type', type);
        heart.setAttribute('data-points', points);
        
        gameArea.appendChild(heart);
        
        const fallInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(fallInterval);
                heart.remove();
                return;
            }
            
            const heartRect = heart.getBoundingClientRect();
            const catcherRect = catcher.getBoundingClientRect();
            const gameRect = gameArea.getBoundingClientRect();
            
            if (heartRect.bottom >= catcherRect.top &&
                heartRect.right >= catcherRect.left &&
                heartRect.left <= catcherRect.right) {
                
                heart.remove();
                clearInterval(fallInterval);
                
                const points = parseInt(heart.getAttribute('data-points'));
                const type = heart.getAttribute('data-type');
                
                if (type === 'bad') {
                    lives_count--;
                    combo = 0;
                    
                    catcher.style.transform = 'translateX(-50%) scale(0.8)';
                    catcher.style.backgroundColor = '#ff0000';
                    
                    if (navigator.vibrate) navigator.vibrate(50);
                    
                    setTimeout(() => {
                        catcher.style.transform = 'translateX(-50%) scale(1)';
                        catcher.style.backgroundColor = 'rgba(255,71,87,0.3)';
                    }, 200);
                    
                } else {
                    score += points;
                    
                    const now = Date.now();
                    if (now - lastCatchTime < 1000) {
                        combo++;
                        if (combo >= 3) {
                            score++;
                            showCombo();
                        }
                    } else {
                        combo = 1;
                    }
                    lastCatchTime = now;
                    
                    catcher.style.transform = 'translateX(-50%) scale(1.2)';
                    catcher.style.backgroundColor = 'rgba(255,215,0,0.5)';
                    
                    if (type === 'gold' && lives_count < 3) {
                        lives_count++;
                    }
                    
                    if (navigator.vibrate) navigator.vibrate(10);
                    
                    setTimeout(() => {
                        catcher.style.transform = 'translateX(-50%) scale(1)';
                        catcher.style.backgroundColor = 'rgba(255,71,87,0.3)';
                    }, 100);
                }
                
                updateScore();
                updateLives();
                
                if (score >= 7) { // Цель - 7 очков
                    win();
                }
                
                if (lives_count <= 0) {
                    gameOver();
                }
            }
            
            if (heartRect.top > gameRect.bottom) {
                heart.remove();
                clearInterval(fallInterval);
                
                if (gameActive) {
                    const type = heart.getAttribute('data-type');
                    
                    if (type !== 'bad') {
                        lives_count--;
                        combo = 0;
                        
                        catcher.style.transform = 'translateX(-50%) scale(0.8)';
                        catcher.style.backgroundColor = '#ff0000';
                        
                        setTimeout(() => {
                            catcher.style.transform = 'translateX(-50%) scale(1)';
                            catcher.style.backgroundColor = 'rgba(255,71,87,0.3)';
                        }, 200);
                        
                        updateLives();
                        
                        if (lives_count <= 0) {
                            gameOver();
                        }
                    }
                }
            }
        }, 50);
    }
    
    function showCombo() {
        const comboEl = document.createElement('div');
        comboEl.textContent = 'x3 COMBO!';
        comboEl.style.position = 'absolute';
        comboEl.style.top = '50%';
        comboEl.style.left = '50%';
        comboEl.style.transform = 'translate(-50%, -50%)';
        comboEl.style.color = '#ffd700';
        comboEl.style.fontSize = '30px';
        comboEl.style.fontWeight = 'bold';
        comboEl.style.zIndex = '100';
        comboEl.style.animation = 'combo 0.5s ease-out forwards';
        
        gameArea.appendChild(comboEl);
        
        setTimeout(() => comboEl.remove(), 500);
    }
    
    function updateScore() {
        scoreEl.textContent = score;
    }
    
    function updateLives() {
        lives.forEach((life, index) => {
            if (index < lives_count) {
                life.classList.add('active');
            } else {
                life.classList.remove('active');
            }
        });
    }
    
    function gameOver() {
        endGame();
        alert('Ой! Сердечки разбились... Но ты можешь попробовать еще раз! ❤️');
        
        setTimeout(() => {
            if (!gameWon) {
                gameStartBtn.classList.remove('hidden');
            }
        }, 500);
    }
    
    function win() {
        gameWon = true; // Запоминаем победу
        endGame();
        bonusMessage.classList.add('visible');
        
        // Прячем кнопку игры навсегда
        gameStartBtn.classList.add('hidden');
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => createFirework(), i * 70);
        }
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    
    // ========== ФЕЙЕРВЕРК ==========
    function createFirework() {
        const colors = ['#ff4d4d', '#ffd700', '#ff6b6b', '#ffb347', '#ff69b4'];
        const emojis = ['❤️', '✨', '🌟', '💫', '💖', '💝'];
        
        const firework = document.createElement('div');
        firework.style.position = 'fixed';
        firework.style.left = Math.random() * 100 + '%';
        firework.style.top = Math.random() * 100 + '%';
        firework.style.fontSize = (Math.random() * 40 + 20) + 'px';
        firework.style.zIndex = '1000';
        firework.style.pointerEvents = 'none';
        firework.style.animation = 'firework 1s ease-out forwards';
        firework.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
        firework.style.color = colors[Math.floor(Math.random() * colors.length)];
        firework.style.textShadow = '0 0 20px currentColor';
        
        document.body.appendChild(firework);
        
        setTimeout(() => firework.remove(), 1000);
    }
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes firework {
            0% {
                opacity: 1;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1.5) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(2) rotate(360deg);
            }
        }
        
        @keyframes combo {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.5);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(2);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация первого слайда
    setTimeout(() => {
        goToSlide(0);
    }, 100);
    
    console.log('Сайт загружен! ❤️');
});

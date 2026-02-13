window.addEventListener('load', function() {
    console.log('Сайт загружается...');
    
    // ========== ОСНОВНЫЕ ЭЛЕМЕНТЫ ==========
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    const sliderTrack = document.getElementById('sliderTrack');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const finalMessage = document.getElementById('finalMessage');
    const gameStartBtn = document.getElementById('gameStartBtn');
    const gameContainer = document.getElementById('gameContainer');
    const gameArea = document.getElementById('gameArea');
    const catcher = document.getElementById('catcher');
    const scoreEl = document.getElementById('score');
    const lives = document.querySelectorAll('.life');
    const exitGame = document.getElementById('exitGame');
    const bonusMessage = document.getElementById('bonusMessage');
    const closeBonus = document.getElementById('closeBonus');
    
    console.log('Элементы найдены:', { 
        gameStartBtn: !!gameStartBtn, 
        slides: slides.length,
        gameContainer: !!gameContainer
    });
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Переменные игры
    let gameActive = false;
    let score = 0;
    let lives_count = 3;
    let gameInterval;
    let catcherX = 50;
    let combo = 0;
    let lastCatchTime = 0;
    let gameWon = false;
    
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
        console.log('Переход на слайд:', index, 'Всего слайдов:', totalSlides);
        
        currentSlide = index;
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Обновляем точки
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        
        // На последнем слайде
        if (currentSlide === totalSlides - 1) {
            console.log('Последний слайд!');
            if (finalMessage) finalMessage.classList.add('visible');
            
            // ПОКАЗЫВАЕМ КНОПКУ ИГРЫ (если еще не победа)
            if (!gameWon && gameStartBtn) {
                console.log('Показываем кнопку игры');
                gameStartBtn.classList.remove('hidden');
                
                // Для телефона: принудительно показываем
                gameStartBtn.style.display = 'block';
                gameStartBtn.style.visibility = 'visible';
                gameStartBtn.style.opacity = '1';
                gameStartBtn.style.pointerEvents = 'auto';
                gameStartBtn.style.zIndex = '10000';
            }
        } else {
            if (finalMessage) finalMessage.classList.remove('visible');
            // НЕ ПРЯЧЕМ КНОПКУ на других слайдах
        }
    }
    
    // Точки
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
            console.log('Клик по стартовому экрану');
            startScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            setTimeout(() => goToSlide(0), 100);
        });
        
        startScreen.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            setTimeout(() => goToSlide(0), 100);
        });
    }
    
    // ========== ИГРА ==========
    if (gameStartBtn) {
        console.log('Кнопка игры найдена, вешаем обработчики');
        
        // Обработчик для клика
        gameStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Клик по кнопке игры');
            startGame();
        });
        
        // Обработчик для касания на телефоне
        gameStartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Тап по кнопке игры');
            startGame();
        });
        
        // Принудительные стили для телефона
        gameStartBtn.style.display = 'block';
        gameStartBtn.style.visibility = 'visible';
        gameStartBtn.style.opacity = '1';
        gameStartBtn.style.pointerEvents = 'auto';
        gameStartBtn.style.zIndex = '10000';
    } else {
        console.error('Кнопка игры не найдена!');
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
        console.log('Запуск игры');
        gameActive = true;
        score = 0;
        lives_count = 3;
        combo = 0;
        updateScore();
        updateLives();
        
        if (gameArea) gameArea.innerHTML = '';
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            console.log('Игра показана');
        }
        
        // Прячем кнопку игры
        if (gameStartBtn) gameStartBtn.classList.add('hidden');
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            if (gameActive) {
                createHeart();
            }
        }, 600);
        
        if (gameArea) {
            gameArea.addEventListener('touchmove', moveCatcherTouch, { passive: false });
            gameArea.addEventListener('mousemove', moveCatcher);
            
            gameArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        }
    }
    
    function endGame() {
        gameActive = false;
        if (gameContainer) gameContainer.classList.add('hidden');
        if (gameInterval) clearInterval(gameInterval);
        
        if (gameArea) {
            gameArea.removeEventListener('touchmove', moveCatcherTouch);
            gameArea.removeEventListener('mousemove', moveCatcher);
        }
        
        // Показываем кнопку игры снова (если не победа)
        if (!gameWon && gameStartBtn) {
            gameStartBtn.classList.remove('hidden');
            
            // Для телефона
            gameStartBtn.style.display = 'block';
            gameStartBtn.style.visibility = 'visible';
            gameStartBtn.style.opacity = '1';
            gameStartBtn.style.pointerEvents = 'auto';
            gameStartBtn.style.zIndex = '10000';
        }
    }
    
    function moveCatcher(e) {
        if (!gameActive || !catcher || !gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
        catcherX = (x / rect.width) * 100;
    }
    
    function moveCatcherTouch(e) {
        if (!gameActive || !catcher || !gameArea) return;
        e.preventDefault();
        const rect = gameArea.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
        catcherX = (x / rect.width) * 100;
    }
    
    function createHeart() {
        if (!gameActive || !gameArea) return;
        
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
            if (!gameActive || !catcher || !gameArea) {
                clearInterval(fallInterval);
                if (heart) heart.remove();
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
                
                if (score >= 25) {
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
        if (!gameArea) return;
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
        if (scoreEl) scoreEl.textContent = score;
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
        console.log('Игра проиграна');
        endGame();
        alert('Ой! Сердечки разбились... Но ты можешь попробовать еще раз! ❤️');
        
        setTimeout(() => {
            if (!gameWon && gameStartBtn) {
                gameStartBtn.classList.remove('hidden');
                
                // Для телефона
                gameStartBtn.style.display = 'block';
                gameStartBtn.style.visibility = 'visible';
                gameStartBtn.style.opacity = '1';
                gameStartBtn.style.pointerEvents = 'auto';
                gameStartBtn.style.zIndex = '10000';
            }
        }, 500);
    }
    
    function win() {
        console.log('Победа!');
        gameWon = true;
        endGame();
        if (bonusMessage) bonusMessage.classList.add('visible');
        
        if (gameStartBtn) gameStartBtn.classList.add('hidden');
        
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
    
    // Стили для анимаций
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
    
    // Принудительно показываем первый слайд
    setTimeout(() => {
        console.log('Инициализация...');
        if (totalSlides > 0) {
            goToSlide(0);
        }
    }, 500);
    
    console.log('Сайт загружен!');
});

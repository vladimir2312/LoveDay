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
    const totalSlides = slides.length;
    
    console.log('Слайдов найдено:', totalSlides);
    console.log('Стрелки:', prevBtn, nextBtn);
    
    // Переменные игры
    let gameActive = false;
    let score = 0;
    let lives_count = 3;
    let gameInterval;
    let combo = 0;
    let lastCatchTime = 0;
    let gameWon = false;
    let gameStarted = false;
    
    // Для мобильных свайпов
    let touchStartX = 0;
    
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
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        
        currentSlide = index;
        
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            console.log('Переход на слайд:', currentSlide);
        }
        
        // Обновляем точки
        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Если дошли до последнего слайда и игра еще не начиналась
        if (currentSlide === totalSlides - 1 && !gameStarted && !gameWon) {
            console.log('Последний слайд, запускаем игру');
            setTimeout(() => {
                startGame();
            }, 1000);
        }
        
        // Финальное сообщение
        if (finalMessage) {
            if (currentSlide === totalSlides - 1) {
                finalMessage.classList.add('visible');
            } else {
                finalMessage.classList.remove('visible');
            }
        }
    }
    
    // Стрелки - ПРОВЕРЯЕМ ЧТО ОНИ РАБОТАЮТ
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Клик на prev');
            goToSlide(currentSlide - 1);
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Клик на next');
            goToSlide(currentSlide + 1);
        };
    }
    
    // Точки
    dots.forEach((dot, index) => {
        dot.onclick = function(e) {
            e.preventDefault();
            console.log('Клик на точку', index);
            goToSlide(index);
        };
    });
    
    // Свайпы для мобильных
    if (sliderTrack) {
        sliderTrack.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        });
        
        sliderTrack.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = touchStartX - touchEndX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
            }
        });
    }
    
    // ========== СТАРТОВЫЙ ЭКРАН ==========
    if (startScreen) {
        startScreen.onclick = function() {
            console.log('Клик по стартовому экрану');
            startScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            goToSlide(0);
        };
    }
    
    // ========== ИГРА ==========
    if (exitGame) {
        exitGame.onclick = function() {
            endGame();
        };
    }
    
    if (closeBonus) {
        closeBonus.onclick = function() {
            bonusMessage.classList.remove('visible');
        };
    }
    
    function startGame() {
        if (gameStarted || gameWon) return;
        
        console.log('Запуск игры');
        gameStarted = true;
        gameActive = true;
        score = 0;
        lives_count = 3;
        combo = 0;
        updateScore();
        updateLives();
        
        if (gameArea) gameArea.innerHTML = '';
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            if (gameActive) {
                createHeart();
            }
        }, 600);
        
        if (gameArea) {
            gameArea.addEventListener('touchmove', moveCatcherTouch, { passive: false });
            gameArea.addEventListener('mousemove', moveCatcher);
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
        
        if (!gameWon) {
            gameStarted = false;
        }
    }
    
    function moveCatcher(e) {
        if (!gameActive || !catcher || !gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
    }
    
    function moveCatcherTouch(e) {
        if (!gameActive || !catcher || !gameArea) return;
        e.preventDefault();
        const rect = gameArea.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        x = Math.max(50, Math.min(rect.width - 50, x));
        catcher.style.left = x + 'px';
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
                
                const type = heart.getAttribute('data-type');
                
                if (type === 'bad') {
                    lives_count--;
                    combo = 0;
                    
                    catcher.style.transform = 'translateX(-50%) scale(0.8)';
                    setTimeout(() => {
                        catcher.style.transform = 'translateX(-50%) scale(1)';
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
                    
                    if (type === 'gold' && lives_count < 3) {
                        lives_count++;
                    }
                    
                    setTimeout(() => {
                        catcher.style.transform = 'translateX(-50%) scale(1)';
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
                        setTimeout(() => {
                            catcher.style.transform = 'translateX(-50%) scale(1)';
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
        endGame();
        alert('Ой! Сердечки разбились... Вернись на последнее фото и попробуй еще раз! ❤️');
    }
    
    function win() {
        gameWon = true;
        gameStarted = true;
        gameActive = false;
        
        if (gameContainer) gameContainer.classList.add('hidden');
        if (gameInterval) clearInterval(gameInterval);
        if (bonusMessage) bonusMessage.classList.add('visible');
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => createFirework(), i * 70);
        }
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
        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 1000);
    }
    
    // Стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes firework {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
            100% { opacity: 0; transform: scale(2) rotate(360deg); }
        }
        @keyframes combo {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }
    `;
    document.head.appendChild(style);
    
    // Стартуем с первого слайда
    setTimeout(() => {
        goToSlide(0);
    }, 500);
    
    console.log('Сайт загружен!');
});

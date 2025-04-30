document.addEventListener('DOMContentLoaded', function() {
    // Terminal loader animation
    const terminalText = "Initializing B.L.A.D.E. systems...\n\n> Loading core modules [##########] 100%\n> Establishing secure connections...\n> Verifying encryption protocols...\n> Blockchain interface ready\n> Anonymous routing enabled\n\n> System initialization complete\n\n> Welcome to the resistance";
    const typeElement = document.querySelector('.type-text');
    const terminalLoader = document.querySelector('.terminal-loader');
    
    let i = 0;
    function typeWriter() {
        if (i < terminalText.length) {
            typeElement.innerHTML += terminalText.charAt(i);
            i++;
            setTimeout(typeWriter, Math.random() * 50 + 10);
        } else {
            setTimeout(() => {
                terminalLoader.style.opacity = '0';
                setTimeout(() => {
                    terminalLoader.style.display = 'none';
                }, 500);
            }, 1500);
        }
    }
    
    setTimeout(typeWriter, 1000);
    
    // Header scroll effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    menuToggle.addEventListener('click', function() {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (nav.style.display === 'flex') {
                    nav.style.display = 'none';
                }
            }
        });
    });
    
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#64ffda"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#64ffda",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // XSS Protection
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    // Check for console tampering
    const originalConsoleLog = console.log;
    console.log = function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('xss')) {
            console.warn('Potential XSS attempt detected');
            return;
        }
        originalConsoleLog.apply(console, arguments);
    };
    
    // Disable right-click (optional)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Detect DevTools opening
    let devtools = /./;
    devtools.toString = function() {
        console.warn('DevTools detection triggered');
        document.body.classList.add('devtools-open');
        return '';
    };
    console.log('%c', devtools);
});

// Service Worker for offline support and caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Добавить после particlesJS инициализации
const cyberTerminal = document.createElement('div');
cyberTerminal.className = 'cyber-terminal';
cyberTerminal.innerHTML = `
  <div class="terminal-window">
    <div class="terminal-header">
      <span>root@blade:~</span>
      <div class="terminal-controls">
        <i class="fas fa-minus"></i>
        <i class="fas fa-expand"></i>
        <i class="fas fa-times"></i>
      </div>
    </div>
    <div class="terminal-body">
      <div class="terminal-content" contenteditable="true"></div>
    </div>
  </div>
`;
document.body.appendChild(cyberTerminal);


/* Добавить команды для терминала */
const commands = {
    help: () => "Available commands: help, connect, encrypt, decrypt, status",
    connect: () => "Establishing secure connection to B.L.A.D.E. network...",
    encrypt: () => `File encrypted with SHA-256: ${Math.random().toString(36).substring(2,15)}`,
    status: () => "System secure. All shields active.",
    clear: () => { document.querySelector('.terminal-content').innerHTML = ''; return ""; }
  };
  
  document.querySelector('.terminal-content').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = this.textContent.trim();
      const command = text.split('\n').pop().replace('>', '').trim();
      let response = "Unknown command. Type 'help' for available commands.";
      
      if (commands[command.split(' ')[0]]) {
        response = commands[command.split(' ')[0]]();
      }
      
      this.innerHTML += `<br>> ${response}<br>> `;
      this.scrollTop = this.scrollHeight;
    }
  });



  // Заменить particlesJS на это в script.js
const matrixCanvas = document.createElement('canvas');
matrixCanvas.id = 'matrix-canvas';
document.querySelector('.hero').appendChild(matrixCanvas);

const ctx = matrixCanvas.getContext('2d');
matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = matrixCanvas.width / fontSize;
const rainDrops = [];

for (let x = 0; x < columns; x++) {
  rainDrops[x] = 1;
}

const draw = () => {
  ctx.fillStyle = 'rgba(10, 25, 47, 0.05)';
  ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  
  ctx.fillStyle = '#64ffda';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < rainDrops.length; i++) {
    const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
    
    if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
      rainDrops[i] = 0;
    }
    rainDrops[i]++;
  }
};

setInterval(draw, 30);


// Добавить в script.js перед закрывающим тегом
const threatLevel = document.createElement('div');
threatLevel.className = 'threat-level';
threatLevel.innerHTML = `
  <div class="threat-meter">
    <div class="threat-bar"></div>
    <div class="threat-label">THREAT LEVEL: <span>NORMAL</span></div>
  </div>
`;
document.body.appendChild(threatLevel);



// Логика изменения уровня угрозы
const threats = ['NORMAL', 'ELEVATED', 'HIGH', 'EXTREME'];
const colors = ['#50fa7b', '#f1fa8c', '#ffb86c', '#ff5555'];

function updateThreatLevel() {
  const random = Math.random();
  const level = random > 0.95 ? 3 : random > 0.8 ? 2 : random > 0.5 ? 1 : 0;
  
  document.querySelector('.threat-bar').style.width = `${level * 33}%`;
  document.querySelector('.threat-label span').textContent = threats[level];
  document.querySelector('.threat-label span').style.color = colors[level];
  document.querySelector('.threat-meter').style.borderLeftColor = colors[level];
  
  setTimeout(updateThreatLevel, 5000 + Math.random() * 10000);
}

updateThreatLevel();

 
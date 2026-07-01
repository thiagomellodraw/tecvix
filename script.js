document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Hero Entrance Animation
    const hero = document.querySelector('.hero');
    if (hero) {
        // Subtle delay to allow CSS loading and smoother transition
        setTimeout(() => {
            hero.classList.add('loaded');
        }, 100);
    }

    // 2. Header Style & Active Nav Links on Scroll
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        // Toggle header scrolled appearance
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Detect active section and update navigation highlight
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset for header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run once on init

    // 3. Mobile Navigation Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav-link, .nav .btn');

    const toggleMenu = () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Prevent body scrolling when menu is active
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    mobileMenuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking on nav links
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside of header
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !header.contains(e.target)) {
            toggleMenu();
        }
    });

    // 4. Services Interactive Tab Center
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanelId = button.getAttribute('aria-controls');

            // Set buttons active state
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Switch panel display with soft crossfade
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });

            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                // Trigger reveal for any cards within the newly opened panel
                const cards = targetPanel.querySelectorAll('.service-card, .insp-card-full');
                cards.forEach((card, idx) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, idx * 100);
                });
            }
        });
    });

    // 5. Scroll Reveal Effect (IntersectionObserver)
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // stop observing once animation triggers
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    // Targets to observe
    const elementsToReveal = [
        document.querySelector('.about-text'),
        document.querySelector('.about-visual'),
        document.querySelector('.services-tabs-container'),
        document.querySelector('.contact-info'),
        document.querySelector('.contact-form-container')
    ];

    elementsToReveal.forEach(el => {
        if (el) revealObserver.observe(el);
    });

    // Observe MVV Cards for staggered reveal
    const mvvCards = document.querySelectorAll('.mvv-card');
    const mvvCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    };
    const mvvObserver = new IntersectionObserver(mvvCallback, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    mvvCards.forEach(card => mvvObserver.observe(card));

    // 5.5 Hero Blueprint Scanner Scroll-Driven Animation
    const heroScanner = document.querySelector('.hero-scanner');
    const heroSection = document.getElementById('home');
    if (heroScanner && heroSection) {
        const updateHeroScannerProgress = () => {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;
            
            // O morphing se completa rapidamente ao rolar 250px, tornando a transição bem visível
            let progress = scrollY / 250;
            progress = Math.max(0, Math.min(1, progress)); // Garante entre 0 e 1
            
            heroScanner.style.setProperty('--scan-percent', `${progress * 100}%`);
        };
        
        window.addEventListener('scroll', updateHeroScannerProgress);
        window.addEventListener('resize', updateHeroScannerProgress);
        updateHeroScannerProgress(); // Executa no carregamento inicial
    }

    // 6. Interactive Contact Form with Validation
    const contactForm = document.getElementById('form-contato');
    const formStatus = document.getElementById('form-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear status
            formStatus.className = 'form-status';
            formStatus.textContent = '';
            formStatus.style.display = 'none';

            // Extract values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();

            // Client-side Validation
            if (!name || !email || !phone || !message) {
                showFormStatus('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showFormStatus('Por favor, insira um e-mail corporativo válido.', 'error');
                return;
            }

            // Envio real do formulário via AJAX utilizando o FormSubmit.co
            setSubmitLoading(true);
            
            try {
                const response = await fetch('https://formsubmit.co/ajax/tecvix@texvixengenharia.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        Nome: name,
                        Email: email,
                        Telefone: phone,
                        Mensagem: message
                    })
                });
                
                if (response.ok) {
                    showFormStatus('Mensagem enviada com sucesso! A equipe da TECVIX entrará em contato em breve.', 'success');
                    contactForm.reset();
                    
                    // Limpa estados ativos de labels flutuantes
                    const inputs = contactForm.querySelectorAll('.form-input');
                    inputs.forEach(input => {
                        input.blur();
                    });
                } else {
                    throw new Error('Falha na resposta do servidor');
                }
            } catch (err) {
                showFormStatus('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou entre em contato direto via WhatsApp/E-mail.', 'error');
            } finally {
                setSubmitLoading(false);
            }
        });
    }

    // Helper functions for Form
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showFormStatus(msg, type) {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
    }

    function setSubmitLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 50 50" style="display:inline-block; vertical-align:middle; animation:spin 1s linear infinite; margin-right:8px; fill:currentColor;">
                    <path d="M25,5A20,20,0,1,0,45,25A2,2,0,0,0,41,25A16,16,0,1,1,25,9A2,2,0,0,0,25,5Z"/>
                </svg> Enviando...
            `;
            // Inline stylesheet for loading spinner animation
            if (!document.getElementById('spinner-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spinner-keyframes';
                style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar Mensagem';
        }
    }

    // 7. Efeito Interativo de Soldar sob o Cursor do Mouse (Preso às Bordas e Dourado)
    const weldableCards = document.querySelectorAll('.service-card, .mvv-card, .contact-form-container');
    
    weldableCards.forEach(card => {
        let welderArc = null;
        let lastX = 0;
        let lastY = 0;
        
        const createCardSpark = (x, y, nx, ny) => {
            const spark = document.createElement('div');
            spark.className = 'welding-spark-card';
            
            // Filetes lineares bem maiores (streak da solda real)
            const height = Math.random() * 20 + 15; // 15px a 35px de comprimento
            const width = Math.random() * 1.0 + 2.0; // 2px a 3px de espessura
            
            // Apenas cores douradas, âmbar e laranja (removido o branco para ser 100% dourado)
            const colors = ['#ffe600', '#ffd700', '#ffaa00', '#ff7700', '#ff4400'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Direções baseadas no vetor normal da borda (faíscas espalham para fora do card, +- 50 graus de dispersão)
            const baseAngle = Math.atan2(ny, nx);
            const angleRad = baseAngle + (Math.random() - 0.5) * (Math.PI * 0.55);
            const speed = Math.random() * 60 + 40; // voa de 40px a 100px
            
            const dx = Math.cos(angleRad) * speed;
            const dy = Math.sin(angleRad) * speed + 15; // gravidade descendente
            
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            const duration = Math.random() * 0.4 + 0.4; // queima em 0.4s a 0.8s
            
            spark.style.width = `${width}px`;
            spark.style.height = `${height}px`;
            spark.style.backgroundColor = color;
            spark.style.color = color;
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);
            spark.style.setProperty('--angle', `${angleDeg}deg`);
            spark.style.animation = `spark-streak-card ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;
            
            card.appendChild(spark);
            
            setTimeout(() => {
                spark.remove();
            }, duration * 1000);
        };
        
        card.addEventListener('mouseenter', (e) => {
            // Cria o ponto do arco de solda
            if (!welderArc) {
                welderArc = document.createElement('div');
                welderArc.className = 'welder-arc-card';
                card.appendChild(welderArc);
            }
            
            const rect = card.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            const width = card.offsetWidth;
            const height = card.offsetHeight;
            
            // Calcula a distância do mouse para cada borda
            const d_top = my;
            const d_bottom = height - my;
            const d_left = mx;
            const d_right = width - mx;
            const min = Math.min(d_top, d_bottom, d_left, d_right);
            
            let x = 0, y = 0;
            if (min === d_top) {
                x = Math.max(0, Math.min(width, mx)); y = 0;
            } else if (min === d_bottom) {
                x = Math.max(0, Math.min(width, mx)); y = height;
            } else if (min === d_left) {
                x = 0; y = Math.max(0, Math.min(height, my));
            } else {
                x = width; y = Math.max(0, Math.min(height, my));
            }
            
            welderArc.style.left = `${x}px`;
            welderArc.style.top = `${y}px`;
            
            // Pequeno delay para acender o arco de solda suavemente
            setTimeout(() => {
                if (welderArc) welderArc.style.opacity = '1';
            }, 50);
            
            lastX = x;
            lastY = y;
        });
        
        card.addEventListener('mousemove', (e) => {
            if (!welderArc) return;
            
            const rect = card.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            const width = card.offsetWidth;
            const height = card.offsetHeight;
            
            // Encontra qual borda está mais próxima do cursor do mouse
            const d_top = my;
            const d_bottom = height - my;
            const d_left = mx;
            const d_right = width - mx;
            const min = Math.min(d_top, d_bottom, d_left, d_right);
            
            let x = 0, y = 0, nx = 0, ny = 0;
            
            // Prende a bolinha (arco de solda) na borda mais próxima
            if (min === d_top) {
                x = Math.max(0, Math.min(width, mx)); y = 0; nx = 0; ny = -1;
            } else if (min === d_bottom) {
                x = Math.max(0, Math.min(width, mx)); y = height; nx = 0; ny = 1;
            } else if (min === d_left) {
                x = 0; y = Math.max(0, Math.min(height, my)); nx = -1; ny = 0;
            } else {
                x = width; y = Math.max(0, Math.min(height, my)); nx = 1; ny = 0;
            }
            
            welderArc.style.left = `${x}px`;
            welderArc.style.top = `${y}px`;
            
            // Calcula a distância movida desde o último evento
            const dist = Math.hypot(x - lastX, y - lastY);
            
            // Gera faíscas proporcionalmente ao movimento
            if (dist > 4) {
                const numSparks = Math.floor(dist / 6) + 1;
                const sparksToSpawn = Math.min(numSparks, 4);
                
                for (let i = 0; i < sparksToSpawn; i++) {
                    createCardSpark(x, y, nx, ny);
                }
                
                lastX = x;
                lastY = y;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (welderArc) {
                welderArc.style.opacity = '0';
                const tempArc = welderArc;
                welderArc = null;
                setTimeout(() => {
                    if (tempArc && !welderArc) {
                        tempArc.remove();
                    }
                }, 200);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {

    //LÓGICA DO SELETOR DE TEMA
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
            body.classList.add('dark-theme');
            if(themeSwitcher) themeSwitcher.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            if(themeSwitcher) themeSwitcher.textContent = '🌙';
        }
    }

    if(themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeSwitcher.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                themeSwitcher.textContent = '🌙';
            }
        });
    }
    
    //LÓGICA PRINCIPAL DO PORTFÓLIO
    const isMobile = window.innerWidth <= 850;

    async function initializePortfolio() {
        try {
            const response = await fetch('site-data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            //Cria o conteúdo HTML a partir do JSON
            populateContent(data);
            //Configura TODOS os cliques DEPOIS que o conteúdo existe
            setupEventListeners();
            //Configura o ano do rodapé
            setFooterYear();

        } catch (error) {
            console.error("Não foi possível carregar os dados do site:", error);
            document.body.innerHTML = '<p style="color: white; text-align: center; font-size: 24px; padding-top: 50px;">Erro ao carregar conteúdo. Verifique o console.</p>';
        }
    }

    function populateContent(data) {
        document.title = data.personalInfo.pageTitle;
        
        const profileImage = document.getElementById('profile-image');
        if (profileImage && data.personalInfo.profileImage) {
            profileImage.src = data.personalInfo.profileImage;
            profileImage.alt = `Foto de ${data.personalInfo.name}`;
        }
        
        const aboutTagline = document.getElementById('about-tagline');
        if (aboutTagline && data.personalInfo.tagline) {
            aboutTagline.textContent = data.personalInfo.tagline;
        }

        const navContainer = document.getElementById('nav-container');
        navContainer.innerHTML = data.navigation.map(item => 
            `<li><a href="#" class="nav-link" data-window-target="${item.target}">${item.text}</a></li>`
        ).join('');

        populateWindow('readme', data.windows.readme);
        populateWindow('about', data.windows.about);
        populateWindow('projects', data.windows.projects);
        populateWindow('contact', data.windows.contact);
        
        document.getElementById('about-text-container').innerHTML = data.personalInfo.aboutText.map(p => `<p>${p}</p>`).join('');
        if (data.windows.readme.text && Array.isArray(data.windows.readme.text)) {
            document.getElementById('readme-text-container').innerHTML = data.windows.readme.text.map(p => `<p>${p}</p>`).join('');
        }

        const contactLinksContainer = document.getElementById('contact-links-container');
        contactLinksContainer.innerHTML = data.windows.contact.links.map(link => 
            `<li><a href="${link.url}" target="_blank" class="neon-link">${link.name}</a></li>`
        ).join('');
        
        const projectListContainer = document.getElementById('project-list-container');
        const projectViewContainer = document.getElementById('project-view');
        projectListContainer.innerHTML = '';
        projectViewContainer.innerHTML = '';

        const visibleProjects = data.projects.filter(project => project.status === "publico");

        visibleProjects.forEach(project => {
            projectListContainer.innerHTML += `<li><a href="#" class="project-link" data-project-target="${project.id}">> ${project.menu_title}</a></li>`;
            
            let galleryHTML = '';
            if (project.images && project.images.length > 0) {
                const galleryType = project.images[0].type || 'principal';
                const imagesHTML = project.images.map(image => `<div class="gallery-item ${image.type}"><img src="${image.src}" alt="${image.alt}"></div>`).join('');
                galleryHTML = `<div class="visual-item ${galleryType}"><h4>// VISUALIZAÇÃO</h4><div class="image-gallery">${imagesHTML}</div></div>`;
            }

            const technologiesHTML = project.technologies.map(tech => `<span>${tech}</span>`).join('');
            const summaryHTML = project.summary.map(p => `<p>${p}</p>`).join('');
            
            let findingsHTML = '';
            if (project.findings && project.findings.length > 0) {
                findingsHTML = `<h4>// RESULTADOS</h4><ul>${project.findings.map(finding => `<li>${finding}</li>`).join('')}</ul>`;
            }

            let codeSnippetHTML = '';
            if (project.code_snippet) {
                const codeType = project.code_type || 'principal';
                codeSnippetHTML = `<div class="visual-item ${codeType}"><h4>// CÓDIGO</h4><div class="terminal-window"><pre><code>${project.code_snippet}</code></pre></div></div>`;
            }

            let linksHTML = '';
            if (project.links && project.links.length > 0) {
                linksHTML = project.links.map(link => `<a href="${link.url}" target="_blank" class="neon-link">${link.text}</a>`).join(' ');
            }
            
            let rightColumnHTML = galleryHTML + codeSnippetHTML;
            
            projectViewContainer.innerHTML += `
                <div class="project-page" id="${project.id}">
                    <header class="project-header">
                        <h3>[ ${project.page_title} ]</h3>
                        <button class="back-button" aria-label="Voltar para a área de trabalho">[ X ] VOLTAR</button>
                    </header>
                    <div class="project-content">
                        <div class="project-column">
                            <h4>// RESUMO</h4>
                            ${summaryHTML}
                            <h4>// TECNOLOGIAS</h4>
                            <div class="tag-list">${technologiesHTML}</div>
                            ${findingsHTML} 
                            ${linksHTML}
                        </div>
                        <div class="project-column visuals-column">
                            ${rightColumnHTML}
                        </div>
                    </div>
                </div>`;
        });
    }
    
    function populateWindow(id, data) {
        const titleEl = document.getElementById(`${id}-title`);
        const headingEl = document.getElementById(`${id}-heading`);
        if (titleEl) titleEl.textContent = data.title;
        if (headingEl) headingEl.textContent = data.heading;
    }

    function setupEventListeners() {
        document.querySelectorAll('.close-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                button.closest('.window').style.display = 'none';
            });
        });

        const desktopView = document.getElementById('desktop-view');
        const projectView = document.getElementById('project-view');
        
        document.querySelectorAll('.project-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetPageId = link.getAttribute('data-project-target');
                const targetPage = document.getElementById(targetPageId);
                
                if (targetPage) {
                    desktopView.style.display = 'none';
                    projectView.style.display = 'block';
                    document.querySelectorAll('.project-page').forEach(page => page.style.display = 'none');
                    targetPage.style.display = 'block';
                    window.scrollTo(0, 0);
                }
            });
        });
        
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', () => {
                projectView.style.display = 'none';
                desktopView.style.display = 'block';
            });
        });

        if (!isMobile) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetWindowId = link.getAttribute('data-window-target');
                    const targetWindow = document.getElementById(targetWindowId);
                    if (targetWindow) {
                        targetWindow.style.display = 'block';
                        bringToFront(targetWindow);
                    }
                });
            });

            // Adiciona o listener de clique para CADA janela para trazê-la para frente
            document.querySelectorAll('.window').forEach(windowEl => {
                windowEl.addEventListener('mousedown', () => {
                    bringToFront(windowEl);
                });
            });
        }
    }

    function bringToFront(element) {
        const allWindows = document.querySelectorAll('.window');
        const maxZ = Array.from(allWindows).reduce((max, win) => Math.max(max, parseInt(win.style.zIndex) || 10), 10);
        element.style.zIndex = maxZ + 1;
    }

    function setupDesktopInteraction() {
        interact('.window').draggable({
            allowFrom: '.title-bar',
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })
            ],
            listeners: {
                move: (event) => {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                // O evento 'down' aqui também chama a função, garantindo que o clique para arrastar funcione
                down: (event) => {
                    bringToFront(event.currentTarget);
                }
            }
        });
    }
    
    function setFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
    applySavedTheme();
    
    if (!isMobile) {
        setupDesktopInteraction(); // Prepara a interatividade de arrastar
    }

    initializePortfolio(); // Carrega o conteúdo e configura os cliques
});
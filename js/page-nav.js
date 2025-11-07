// 浮动侧边栏导航功能

// ==================== 生成浮动侧边栏导航 ====================
function generatePageNav(content) {
    // 查找所有h3和h4标题
    const allHeadings = content.querySelectorAll('h3, h4');
    
    // 如果没有标题，不生成导航
    if (allHeadings.length === 0) {
        return;
    }
    
    // 为每个标题添加唯一ID
    allHeadings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `section-${heading.tagName}-${index}`;
        }
    });
    
    // 构建导航数据结构
    const navData = [];
    let currentSection = null;
    
    allHeadings.forEach(heading => {
        if (heading.tagName === 'H3') {
            // h3作为主章节
            currentSection = {
                title: heading.textContent.trim(),
                id: heading.id,
                subsections: []
            };
            navData.push(currentSection);
        } else if (heading.tagName === 'H4' && currentSection) {
            // h4作为子章节
            currentSection.subsections.push({
                title: heading.textContent.trim(),
                id: heading.id
            });
        }
    });
    
    // 生成导航HTML
    let navHTML = '';
    navData.forEach(section => {
        const hasSubsections = section.subsections.length > 0;
        
        navHTML += `
            <div class="nav-section">
                <div class="nav-section-title ${!hasSubsections ? 'collapsed' : ''}" data-target="${section.id}" onclick="scrollToSection('${section.id}', event)">
                    ${hasSubsections ? '<span class="nav-icon">▼</span>' : ''}
                    ${section.title}
                </div>
        `;
        
        if (hasSubsections) {
            navHTML += '<div class="nav-subsection">';
            section.subsections.forEach(subsection => {
                navHTML += `
                    <div class="nav-item" data-target="${subsection.id}" onclick="scrollToSection('${subsection.id}', event)">
                        ${subsection.title}
                    </div>
                `;
            });
            navHTML += '</div>';
        }
        
        navHTML += '</div>';
    });
    
    // 更新浮动导航内容
    const floatingNavContent = document.getElementById('floatingNavContent');
    if (floatingNavContent) {
        floatingNavContent.innerHTML = navHTML;
        
        // 绑定折叠/展开事件
        initNavCollapse();
    }
}

// ==================== 初始化导航折叠功能 ====================
function initNavCollapse() {
    document.querySelectorAll('.nav-section-title').forEach(title => {
        // 只为有子章节的标题添加折叠功能
        const subsection = title.nextElementSibling;
        if (subsection && subsection.classList.contains('nav-subsection')) {
            title.addEventListener('click', function(e) {
                // 如果点击的是标题本身（有子章节），切换折叠状态
                if (e.target === this || e.target.classList.contains('nav-icon')) {
                    e.stopPropagation();
                    this.classList.toggle('collapsed');
                    subsection.classList.toggle('collapsed');
                }
            });
        }
    });
}

// ==================== 滚动到指定章节 ====================
function scrollToSection(targetId, event) {
    event.stopPropagation();
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // 计算偏移量（顶部导航栏+tab栏高度）
        const offset = 120;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // 添加高亮动画
        targetElement.style.transition = 'all 0.3s';
        targetElement.style.backgroundColor = 'rgba(102, 126, 234, 0.15)';
        targetElement.style.padding = '10px';
        targetElement.style.borderRadius = '8px';
        targetElement.style.marginLeft = '-10px';
        
        setTimeout(() => {
            targetElement.style.backgroundColor = '';
            targetElement.style.padding = '';
            targetElement.style.marginLeft = '';
        }, 1500);
        
        // 更新active状态
        updateActiveNavItem(targetId);
    }
}

// ==================== 更新导航active状态 ====================
function updateActiveNavItem(targetId) {
    // 移除所有active
    document.querySelectorAll('.nav-item, .nav-section-title').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加active到当前项
    const activeItem = document.querySelector(`[data-target="${targetId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        
        // 如果是子章节，确保父章节展开
        if (activeItem.classList.contains('nav-item')) {
            const section = activeItem.closest('.nav-section');
            if (section) {
                const sectionTitle = section.querySelector('.nav-section-title');
                const subsection = section.querySelector('.nav-subsection');
                if (sectionTitle && subsection) {
                    sectionTitle.classList.remove('collapsed');
                    subsection.classList.remove('collapsed');
                }
            }
        }
    }
}

// ==================== 切换浮动导航显示/隐藏 ====================
function toggleFloatingNav() {
    const floatingNav = document.getElementById('floatingNav');
    const floatingNavToggle = document.getElementById('floatingNavToggle');
    
    if (floatingNav && floatingNavToggle) {
        floatingNav.classList.toggle('show');
        floatingNavToggle.classList.toggle('nav-open');
    }
}

// ==================== 关闭浮动导航 ====================
function closeFloatingNav() {
    const floatingNav = document.getElementById('floatingNav');
    const floatingNavToggle = document.getElementById('floatingNavToggle');
    
    if (floatingNav && floatingNavToggle) {
        floatingNav.classList.remove('show');
        floatingNavToggle.classList.remove('nav-open');
    }
}

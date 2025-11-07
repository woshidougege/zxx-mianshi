// 张晓雪面试准备手册 - 主要逻辑

// 全局变量
let searchMatches = [];
let currentSearchIndex = 0;
let searchResultsData = [];  // 搜索结果数据（用于侧边栏显示）
let searchDebounceTimer = null;  // 搜索防抖计时器

// Tab配置数据
const tabsConfig = [
    { icon: '📋', label: '个人简历' },
    { icon: '🧪', label: '测试基础' },
    { icon: '🤖', label: '自动化测试' },
    { icon: '🐍', label: 'Python测试' },
    { icon: '🔮', label: 'AI辅助测试' },
    { icon: '💼', label: '项目介绍' },
    { icon: '🎯', label: '面试技巧' }
];

// ==================== Tab切换 ====================
function switchTab(index) {
    const contents = document.querySelectorAll('.content');
    
    contents.forEach(content => content.classList.remove('active'));
    contents[index].classList.add('active');

    localStorage.setItem('activeTab', index);
    window.scrollTo(0, 0);

    // 加载对应tab内容
    loadTabContent(index);
    
    // 更新左侧Tab导航的active状态
    updateTabNavActive(index);
    
    // 更新下拉选择器显示
    updateTabSelector(index);
    
    // 更新下拉菜单的active状态
    updateTabDropdownActive(index);
}

// ==================== 更新Tab选择器显示 ====================
function updateTabSelector(index) {
    const tabSelectorIcon = document.getElementById('tabSelectorIcon');
    const tabSelectorText = document.getElementById('tabSelectorText');
    const tabSelectorBadge = document.getElementById('tabSelectorBadge');
    
    if (tabSelectorIcon && tabSelectorText && tabsConfig[index]) {
        tabSelectorIcon.textContent = tabsConfig[index].icon;
        tabSelectorText.textContent = tabsConfig[index].label;
    }
    
    if (tabSelectorBadge) {
        tabSelectorBadge.textContent = `${index + 1}/${tabsConfig.length}`;
    }
}

// ==================== 更新下拉菜单active状态 ====================
function updateTabDropdownActive(index) {
    const dropdownItems = document.querySelectorAll('.tab-dropdown-item');
    dropdownItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ==================== 切换下拉菜单显示/隐藏 ====================
function toggleTabDropdown() {
    const tabDropdown = document.getElementById('tabDropdown');
    const tabSelector = document.getElementById('tabSelector');
    
    if (tabDropdown && tabSelector) {
        tabDropdown.classList.toggle('show');
        tabSelector.classList.toggle('open');
    }
}

// ==================== 从下拉菜单选择Tab ====================
function selectTab(index) {
    switchTab(index);
    // 选择后关闭下拉菜单
    closeTabDropdown();
}

// ==================== 关闭下拉菜单 ====================
function closeTabDropdown() {
    const tabDropdown = document.getElementById('tabDropdown');
    const tabSelector = document.getElementById('tabSelector');
    
    if (tabDropdown && tabSelector) {
        tabDropdown.classList.remove('show');
        tabSelector.classList.remove('open');
    }
}

// ==================== 从导航切换Tab ====================
function switchTabFromNav(index) {
    switchTab(index);
    // 切换后关闭左侧导航
    closeTabNav();
}

// ==================== 更新左侧Tab导航的active状态 ====================
function updateTabNavActive(index) {
    const tabNavItems = document.querySelectorAll('.tab-nav-item');
    tabNavItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ==================== 切换左侧Tab导航显示/隐藏 ====================
function toggleTabNav() {
    const tabNavPanel = document.getElementById('tabNavPanel');
    const tabNavToggle = document.getElementById('tabNavToggle');
    
    if (tabNavPanel && tabNavToggle) {
        tabNavPanel.classList.toggle('show');
        tabNavToggle.classList.toggle('nav-open');
    }
}

// ==================== 关闭左侧Tab导航 ====================
function closeTabNav() {
    const tabNavPanel = document.getElementById('tabNavPanel');
    const tabNavToggle = document.getElementById('tabNavToggle');
    
    if (tabNavPanel && tabNavToggle) {
        tabNavPanel.classList.remove('show');
        tabNavToggle.classList.remove('nav-open');
    }
}

// ==================== 加载Tab内容 ====================
async function loadTabContent(index) {
    const content = document.getElementById(`content${index}`);
    
    // 如果已加载，直接返回
    if (content.dataset.loaded === 'true') {
        return;
    }

    const filenames = [
        'content/tab1-resume.html',
        'content/tab2-test-basics.html',
        'content/tab3-automation.html',
        'content/tab4-python.html',
        'content/tab5-ai.html',
        'content/tab6-projects.html',
        'content/tab7-interview.html'
    ];

    try {
        const response = await fetch(filenames[index]);
        if (!response.ok) {
            throw new Error('文件加载失败');
        }
        const html = await response.text();
        content.innerHTML = html;
        content.dataset.loaded = 'true';
        
        // 生成页内导航
        generatePageNav(content);
        
        // 自动标记术语（让每个术语都能点击）
        if (typeof markTermsAutomatically === 'function') {
            markTermsAutomatically(content);
        }
        
        // 初始化术语点击事件
        initTermClicks();
    } catch (error) {
        console.error('加载内容失败:', error);
        content.innerHTML = '<p style="color: #f44336; text-align: center; padding: 40px;">内容加载失败，请刷新页面重试</p>';
    }
}

// ==================== 术语点击事件 ====================
function initTermClicks() {
    document.querySelectorAll('.term, .explain').forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            showMobileTooltip(this);
        });
    });
}

// ==================== 显示移动端tooltip ====================
function showMobileTooltip(element) {
    const card = document.getElementById('mobileTooltip');
    const term = element.textContent.replace('🔊', '').replace('❓', '').trim();
    const pronunciation = element.dataset.pronunciation;
    const explain = element.dataset.explain;

    document.getElementById('mobileTerm').textContent = term;
    
    if (pronunciation) {
        document.getElementById('mobilePronunciation').style.display = 'block';
        document.getElementById('mobilePronunValue').textContent = pronunciation;
    } else {
        document.getElementById('mobilePronunciation').style.display = 'none';
    }
    
    if (explain) {
        document.getElementById('mobileExplain').style.display = 'block';
        document.getElementById('mobileExplainValue').textContent = explain;
    } else {
        document.getElementById('mobileExplain').style.display = 'none';
    }

    card.classList.add('show');
}

// ==================== 关闭移动端tooltip ====================
function closeMobileTooltip() {
    document.getElementById('mobileTooltip').classList.remove('show');
}

// ==================== 搜索功能（全局搜索所有tab） ====================
async function performSearch(searchTerm) {
    searchMatches = [];
    searchResultsData = [];
    currentSearchIndex = 0;
    
    if (searchTerm === '') {
        // 清除所有页面的高亮
        const allContents = document.querySelectorAll('.content');
        allContents.forEach(content => clearHighlights(content));
        
        updateSearchUI(0, 0);
        renderSearchResults();
        const panel = document.getElementById('searchResultsPanel');
        if (panel) panel.classList.remove('show');
        const toggleBtn = document.getElementById('searchTogglePanel');
        if (toggleBtn) toggleBtn.classList.remove('show', 'panel-open');
        return;
    }

    // 立即显示搜索面板和按钮
    const panel = document.getElementById('searchResultsPanel');
    const toggleBtn = document.getElementById('searchTogglePanel');
    if (panel) panel.classList.add('show');
    if (toggleBtn) {
        toggleBtn.classList.add('show', 'panel-open');
    }

    // 显示加载状态
    const searchCount = document.getElementById('searchCount');
    const sidebarCounter = document.getElementById('sidebarCounter');
    if (searchCount) {
        searchCount.textContent = '搜索中...';
        searchCount.classList.add('has-results');
    }
    if (sidebarCounter) sidebarCounter.textContent = '搜索中...';
    
    // 显示搜索中的提示
    const sidebarList = document.getElementById('searchResultsList');
    if (sidebarList) {
        sidebarList.innerHTML = `
            <div class="search-results-empty">
                <div class="search-results-empty-icon">🔍</div>
                <p>正在搜索所有页面...</p>
            </div>
        `;
    }

    // 确保所有tab内容都已加载
    for (let i = 0; i < tabsConfig.length; i++) {
        await loadTabContent(i);
    }
    
    // 加载完成后重新获取所有content元素并清除旧的高亮
    const allContents = document.querySelectorAll('.content');
    allContents.forEach(content => clearHighlights(content));
    
    // 在所有tab中搜索
    allContents.forEach((content, tabIndex) => {
        highlightText(content, searchTerm, tabIndex);
    });
    
    // 收集所有高亮的mark元素
    allContents.forEach((content, tabIndex) => {
        const marks = Array.from(content.querySelectorAll('mark'));
        marks.forEach(mark => {
            searchMatches.push(mark);
        });
    });
    
    // 生成搜索结果数据
    searchMatches.forEach((mark, index) => {
        searchResultsData.push({
            index: index,
            element: mark,
            tabIndex: parseInt(mark.dataset.tabIndex),
            section: getSectionName(mark),
            subsection: getSubsectionName(mark),
            context: extractContext(mark)
        });
    });
    
    // 渲染搜索结果到侧边栏
    renderSearchResults();
    
    if (searchMatches.length > 0) {
        currentSearchIndex = 0;
        // 如果第一个结果不在当前tab，切换到对应tab
        const firstMatch = searchMatches[0];
        const firstMatchTab = parseInt(firstMatch.dataset.tabIndex);
        const currentTab = parseInt(localStorage.getItem('activeTab') || '0');
        if (firstMatchTab !== currentTab) {
            switchTab(firstMatchTab);
        }
        highlightCurrentMatch();
        updateSearchUI(searchMatches.length, 1);
        // 面板已经在搜索开始时打开了，这里不需要重复操作
    } else {
        // 没有找到结果
        updateSearchUI(0, 0);
    }
}

function clearHighlights(element) {
    const marks = element.querySelectorAll('mark');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function highlightText(element, searchTerm, tabIndex) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (node.parentElement.tagName === 'SCRIPT' || 
                    node.parentElement.tagName === 'STYLE' ||
                    node.parentElement.tagName === 'MARK') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent;
        const regex = new RegExp(searchTerm, 'gi');
        if (regex.test(text)) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(node => {
        const text = node.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        const fragment = document.createDocumentFragment();
        
        parts.forEach(part => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                const mark = document.createElement('mark');
                mark.textContent = part;
                // 设置tab索引，用于跨tab导航
                mark.dataset.tabIndex = tabIndex;
                fragment.appendChild(mark);
            } else if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        
        node.parentNode.replaceChild(fragment, node);
    });
}

function highlightCurrentMatch() {
    searchMatches.forEach((mark, index) => {
        if (index === currentSearchIndex) {
            mark.classList.add('current');
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            mark.classList.remove('current');
        }
    });
}

function updateSearchUI(total, current) {
    const countEl = document.getElementById('searchCount');
    const prevBtn = document.getElementById('searchPrev');
    const nextBtn = document.getElementById('searchNext');
    
    if (total > 0) {
        countEl.textContent = `${current}/${total}`;
        countEl.classList.add('has-results');
        prevBtn.classList.add('active');
        nextBtn.classList.add('active');
    } else {
        countEl.textContent = '0/0';
        countEl.classList.remove('has-results');
        prevBtn.classList.remove('active');
        nextBtn.classList.remove('active');
    }
}

function navigateSearch(direction) {
    if (searchMatches.length === 0) return;
    
    // 移除当前高亮
    if (searchMatches[currentSearchIndex]) {
        searchMatches[currentSearchIndex].classList.remove('current');
    }
    
    // 更新索引
    if (direction === 'next') {
        currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;
    } else {
        currentSearchIndex = (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;
    }
    
    // 检查是否需要切换tab
    const currentMatch = searchMatches[currentSearchIndex];
    const matchTabIndex = parseInt(currentMatch.dataset.tabIndex);
    const currentTab = parseInt(localStorage.getItem('activeTab') || '0');
    if (matchTabIndex !== currentTab) {
        switchTab(matchTabIndex);
    }
    
    // 高亮当前结果
    highlightCurrentMatch();
    updateSearchUI(searchMatches.length, currentSearchIndex + 1);
    
    // 更新侧边栏列表的active状态
    document.querySelectorAll('.search-result-item').forEach((item) => {
        const itemIndex = parseInt(item.getAttribute('data-index'));
        if (itemIndex === currentSearchIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
    
    // 更新侧边栏计数器
    const sidebarCounter = document.getElementById('sidebarCounter');
    if (sidebarCounter) {
        sidebarCounter.textContent = `${currentSearchIndex + 1}/${searchMatches.length}`;
    }
}

// ==================== 移动端滑动切换Tab ====================
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const swipeThreshold = 50; // 最小滑动距离
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const currentTab = parseInt(localStorage.getItem('activeTab') || '0');
        
        if (diff > 0 && currentTab > 0) {
            // 右滑 - 上一个tab
            switchTab(currentTab - 1);
        } else if (diff < 0 && currentTab < tabsConfig.length - 1) {
            // 左滑 - 下一个tab
            switchTab(currentTab + 1);
        }
    }
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 恢复上次的Tab
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab !== null) {
        switchTab(parseInt(savedTab));
    } else {
        loadTabContent(0);
    }
    
    // 添加移动端滑动事件
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        container.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchPrev = document.getElementById('searchPrev');
    const searchNext = document.getElementById('searchNext');

    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        searchClear.classList.toggle('visible', value.length > 0);
        
        // 防抖：延迟执行搜索
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        
        searchDebounceTimer = setTimeout(() => {
            performSearch(value);
        }, 300); // 300ms延迟
    });

    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        performSearch('');
    });

    // 导航按钮
    searchPrev.addEventListener('click', function() {
        navigateSearch('prev');
    });

    searchNext.addEventListener('click', function() {
        navigateSearch('next');
    });

    // 键盘快捷键
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                navigateSearch('prev');
            } else {
                navigateSearch('next');
            }
        }
    });

    // ESC键关闭下拉菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeTabDropdown();
            closeMobileTooltip();
        }
    });

    // 返回顶部按钮
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 点击其他地方关闭tooltip和下拉菜单
    document.addEventListener('click', function(e) {
        // 关闭tooltip
        if (!e.target.closest('.term') && !e.target.closest('.explain') && !e.target.closest('.mobile-tooltip-card')) {
            closeMobileTooltip();
        }
        
        // 关闭tab下拉菜单
        if (!e.target.closest('.tab-selector-container')) {
            closeTabDropdown();
        }
    });

    // ==================== 侧边栏搜索功能 ====================
    const searchToggleBtn = document.getElementById('searchTogglePanel');
    const searchResultsPanel = document.getElementById('searchResultsPanel');
    const searchResultsClose = document.getElementById('searchResultsClose');
    const sidebarSearchInput = document.getElementById('sidebarSearchInput');
    const sidebarPrevBtn = document.getElementById('sidebarPrevBtn');
    const sidebarNextBtn = document.getElementById('sidebarNextBtn');

    // 双向同步顶部和侧边栏搜索框
    let isSyncing = false;

    searchInput.addEventListener('input', function() {
        if (!isSyncing) {
            isSyncing = true;
            sidebarSearchInput.value = this.value;
            isSyncing = false;
        }
    });

    sidebarSearchInput.addEventListener('input', function() {
        if (!isSyncing) {
            isSyncing = true;
            const value = this.value.trim();
            searchInput.value = this.value;
            searchClear.classList.toggle('visible', value.length > 0);
            
            // 防抖：延迟执行搜索
            if (searchDebounceTimer) {
                clearTimeout(searchDebounceTimer);
            }
            
            searchDebounceTimer = setTimeout(() => {
                performSearch(value);
            }, 300);
            
            isSyncing = false;
        }
    });

    // 侧边栏输入框键盘事件
    sidebarSearchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                navigateSearch('prev');
            } else {
                navigateSearch('next');
            }
        }
    });

    // 侧边栏导航按钮
    sidebarPrevBtn.addEventListener('click', function() {
        navigateSearch('prev');
    });

    sidebarNextBtn.addEventListener('click', function() {
        navigateSearch('next');
    });

    // 切换侧边栏
    searchToggleBtn.addEventListener('click', function() {
        const isOpen = searchResultsPanel.classList.contains('show');
        if (isOpen) {
            searchResultsPanel.classList.remove('show');
            this.classList.remove('panel-open');
        } else {
            searchResultsPanel.classList.add('show');
            this.classList.add('panel-open');
        }
    });

    // 关闭侧边栏
    searchResultsClose.addEventListener('click', function() {
        searchResultsPanel.classList.remove('show');
        searchToggleBtn.classList.remove('panel-open');
    });
});

// ==================== 提取搜索结果上下文 ====================
function extractContext(markElement, maxLength = 80) {
    let text = markElement.textContent;
    let parent = markElement.parentNode;
    
    // 尝试获取父节点的文本内容
    while (parent && parent.textContent.length < maxLength) {
        parent = parent.parentNode;
        if (parent.classList && parent.classList.contains('content')) {
            break;
        }
    }
    
    const fullText = parent ? parent.textContent : text;
    const markText = markElement.textContent;
    const markIndex = fullText.indexOf(markText);
    
    // 提取前后文本
    const before = fullText.substring(Math.max(0, markIndex - 40), markIndex);
    const after = fullText.substring(markIndex + markText.length, markIndex + markText.length + 40);
    
    // 清理空白字符
    const cleanBefore = before.replace(/\s+/g, ' ').trim();
    const cleanAfter = after.replace(/\s+/g, ' ').trim();
    
    return `${cleanBefore ? '...' + cleanBefore : ''}<mark>${markText}</mark>${cleanAfter ? cleanAfter + '...' : ''}`;
}

// ==================== 获取章节名称 ====================
function getSectionName(element) {
    // 找到所属的tab
    let content = element.closest('.content');
    if (!content) return '未知章节';
    
    const contentId = content.id;
    const tabNames = [
        '📋 个人简历',
        '🧪 测试基础',
        '🤖 自动化测试',
        '🐍 Python测试',
        '🔮 AI辅助测试',
        '💼 项目介绍',
        '🎯 面试技巧'
    ];
    const tabIndex = parseInt(contentId.replace('content', ''));
    
    return tabNames[tabIndex] || '未知章节';
}

// ==================== 获取小节名称 ====================
function getSubsectionName(element) {
    // 尝试找最近的h2/h3/h4
    let current = element;
    while (current && current !== document.body) {
        if (current.previousElementSibling) {
            const prev = current.previousElementSibling;
            if (prev.tagName && ['H2', 'H3', 'H4'].includes(prev.tagName)) {
                return prev.textContent.trim();
            }
        }
        current = current.parentElement;
    }
    
    return '';
}

// ==================== 渲染搜索结果列表 ====================
function renderSearchResults() {
    const sidebarList = document.getElementById('searchResultsList');
    const sidebarTitle = document.getElementById('searchResultsTitle');
    const sidebarCounter = document.getElementById('sidebarCounter');
    const sidebarPrevBtn = document.getElementById('sidebarPrevBtn');
    const sidebarNextBtn = document.getElementById('sidebarNextBtn');
    
    if (!sidebarList) return;
    
    if (searchResultsData.length === 0) {
        sidebarList.innerHTML = `
            <div class="search-results-empty">
                <div class="search-results-empty-icon">❌</div>
                <p>未找到匹配结果</p>
                <p style="font-size: 0.85em; color: #999;">试试其他关键词</p>
            </div>
        `;
        sidebarTitle.textContent = '搜索结果 (0)';
        sidebarCounter.textContent = '0/0';
        sidebarPrevBtn.classList.remove('active');
        sidebarNextBtn.classList.remove('active');
        return;
    }
    
    // 按章节分组
    const grouped = {};
    searchResultsData.forEach((item, index) => {
        const section = item.section || '其他';
        if (!grouped[section]) {
            grouped[section] = [];
        }
        grouped[section].push({ ...item, originalIndex: index });
    });
    
    // 生成HTML
    let html = '';
    Object.keys(grouped).forEach(section => {
        html += `
            <div class="search-results-group">
                <div class="search-results-group-title">
                    📂 ${section} (${grouped[section].length})
                </div>
        `;
        
        grouped[section].forEach(item => {
            const isActive = item.originalIndex === currentSearchIndex ? 'active' : '';
            html += `
                <div class="search-result-item ${isActive}" data-index="${item.originalIndex}">
                    <div class="search-result-section">
                        ${item.subsection || ''}
                    </div>
                    <div class="search-result-context">
                        ${item.context}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    sidebarList.innerHTML = html;
    
    // 绑定点击事件
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            jumpToSearchResult(index);
        });
    });
    
    // 更新标题和计数器
    sidebarTitle.textContent = `搜索结果 (${searchResultsData.length})`;
    sidebarCounter.textContent = `${currentSearchIndex + 1}/${searchResultsData.length}`;
    sidebarPrevBtn.classList.add('active');
    sidebarNextBtn.classList.add('active');
}

// ==================== 跳转到指定搜索结果 ====================
function jumpToSearchResult(index) {
    if (index < 0 || index >= searchMatches.length) return;
    
    // 移除当前高亮
    if (searchMatches[currentSearchIndex]) {
        searchMatches[currentSearchIndex].classList.remove('current');
    }
    
    // 更新索引
    currentSearchIndex = index;
    
    // 检查是否需要切换tab
    const currentMatch = searchMatches[currentSearchIndex];
    const matchTabIndex = parseInt(currentMatch.dataset.tabIndex);
    const currentTab = parseInt(localStorage.getItem('activeTab') || '0');
    if (matchTabIndex !== currentTab) {
        switchTab(matchTabIndex);
    }
    
    // 高亮当前结果
    highlightCurrentMatch();
    updateSearchUI(searchMatches.length, currentSearchIndex + 1);
    
    // 更新侧边栏
    document.querySelectorAll('.search-result-item').forEach((item, idx) => {
        const itemIndex = parseInt(item.getAttribute('data-index'));
        if (itemIndex === currentSearchIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
    
    // 更新侧边栏计数器
    const sidebarCounter = document.getElementById('sidebarCounter');
    if (sidebarCounter) {
        sidebarCounter.textContent = `${currentSearchIndex + 1}/${searchMatches.length}`;
    }
}


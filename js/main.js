// 张晓雪面试准备手册 - 主要逻辑

// 全局变量
let searchMatches = [];
let currentSearchIndex = 0;
let searchResultsData = [];  // 搜索结果数据（用于侧边栏显示）

// ==================== Tab切换 ====================
function switchTab(index) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    tabs[index].classList.add('active');
    contents[index].classList.add('active');

    localStorage.setItem('activeTab', index);
    window.scrollTo(0, 0);

    // 加载对应tab内容
    loadTabContent(index);
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

// ==================== 搜索功能 ====================
function performSearch(searchTerm) {
    const activeContent = document.querySelector('.content.active');
    clearHighlights(activeContent);
    searchMatches = [];
    searchResultsData = [];
    currentSearchIndex = 0;
    
    if (searchTerm === '') {
        updateSearchUI(0, 0);
        renderSearchResults();
        const panel = document.getElementById('searchResultsPanel');
        if (panel) panel.classList.remove('show');
        const toggleBtn = document.getElementById('searchTogglePanel');
        if (toggleBtn) toggleBtn.classList.remove('show', 'panel-open');
        return;
    }

    highlightText(activeContent, searchTerm);
    
    // 收集所有高亮的mark元素
    searchMatches = Array.from(activeContent.querySelectorAll('mark'));
    
    // 生成搜索结果数据
    searchMatches.forEach((mark, index) => {
        searchResultsData.push({
            index: index,
            element: mark,
            section: getSectionName(mark),
            subsection: getSubsectionName(mark),
            context: extractContext(mark)
        });
    });
    
    // 渲染搜索结果到侧边栏
    renderSearchResults();
    
    if (searchMatches.length > 0) {
        currentSearchIndex = 0;
        highlightCurrentMatch();
        updateSearchUI(searchMatches.length, 1);
        
        // 自动打开侧边栏
        const panel = document.getElementById('searchResultsPanel');
        if (panel) panel.classList.add('show');
        const toggleBtn = document.getElementById('searchTogglePanel');
        if (toggleBtn) {
            toggleBtn.classList.add('show', 'panel-open');
        }
    } else {
        updateSearchUI(0, 0);
        const toggleBtn = document.getElementById('searchTogglePanel');
        if (toggleBtn) toggleBtn.classList.add('show');
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

function highlightText(element, searchTerm) {
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
                fragment.appendChild(mark);
                searchMatches.push(mark);
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

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 恢复上次的Tab
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab !== null) {
        switchTab(parseInt(savedTab));
    } else {
        loadTabContent(0);
    }

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchPrev = document.getElementById('searchPrev');
    const searchNext = document.getElementById('searchNext');

    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        searchClear.classList.toggle('visible', value.length > 0);
        performSearch(value);
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

    // 点击其他地方关闭tooltip
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.term') && !e.target.closest('.explain') && !e.target.closest('.mobile-tooltip-card')) {
            closeMobileTooltip();
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
            searchInput.value = this.value;
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
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
                <div class="search-results-empty-icon">🔍</div>
                <p>输入关键词开始搜索</p>
            </div>
        `;
        sidebarTitle.textContent = '搜索结果';
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


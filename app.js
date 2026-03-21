// 全局变量
let currentEngine = 'bing';
let currentBgType = 'bing';
let currentThemeColor = '#2780BB';
let currentDisplayMode = 'system';
let currentRealDisplayMode = ''; // 只有light和dark，用于识别当前显示模式
let overlayOpacity = 30;
let quickLinksEnabled = true;
let quickLinks = [];
let showTitle = true;
let customTitleText = '星函标签页';
let showSearchHistoryEnabled = true;
let settingsBackup = null; // 用于重置设置时的备份

let settingsHistory = [];
let settingsHistoryIndex = -1;
let isUndoRedoOperation = false;

let engineSwitchEnabled = true;
let bgInfoEnabled = true;
let directJumpEnabled = false;

// 主题色变量
const lightBg = 'rgba(255, 255, 255, 0.8)';
const darkBg = 'rgba(30, 30, 30, 0.8)';

// 存储必应图片信息
let bingImageInfo = {
    desc: '',
    url: ''
};

// 搜索引擎信息映射
let searchEngines = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
    { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=%s' },
    { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=%s' }
];

// DOM 元素
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const backgroundLayer = document.getElementById('background-layer');
const overlay = document.getElementById('overlay');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettingsBtn = document.getElementById('close-settings');
// const applySettingsBtn = document.getElementById('apply-settings'); // Removed
const bgTypeRadios = document.querySelectorAll('input[name="bg-type"]');
const bgColorPicker = document.getElementById('bg-color-picker');
const bgColorSetting = document.querySelector('.bg-color-setting');
const bgImageSetting = document.querySelector('.bg-image-setting');
const bgImageUpload = document.getElementById('bg-image-upload');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const themeColorPicker = document.getElementById('theme-color-picker');
const displayModeRadios = document.querySelectorAll('input[name="display-mode"]');
let searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
const overlayOpacitySlider = document.getElementById('overlay-opacity');
const overlayOpacityValue = document.querySelector('.opacity-value');
const quickLinksToggle = document.getElementById('quick-links-toggle');
const quickLinksContainer = document.getElementById('quick-links-container');
const linksList = document.getElementById('links-list');
const enginesList = document.getElementById('engines-list');
const addLinkBtn = document.getElementById('add-link-btn');
const addEngineBtn = document.getElementById('add-engine-btn');
const resetSettingsBtn = document.getElementById('reset-settings');
const undoSettingsBtn = document.getElementById('undo-settings');
const redoSettingsBtn = document.getElementById('redo-settings');
const exportSettingsBtn = document.getElementById('export-settings');
const importSettingsInput = document.getElementById('import-settings');
const importFilename = document.getElementById('import-filename');
const toast = document.getElementById('toast');
const showTitleToggle = document.getElementById('show-title-toggle');
const customTitleInput = document.getElementById('custom-title-input');
const titleArea = document.getElementById('title-area');
const customTitle = document.getElementById('custom-title');
const clearSearchHistoryBtn = document.getElementById('clear-history-btn');
const showSearchHistoryToggle = document.getElementById('show-history-toggle');
const showSearchInputContainer = document.getElementById('search-input-container');
let searchEngineQuickRadios = document.querySelectorAll('input[name="search-engine-quick"]');
const engineSwitcherBtn = document.getElementById('engine-switcher-btn');
const engineSwitcherName = document.getElementById('engine-switcher-name');
const engineSwitcherDropdown = document.getElementById('engine-switcher-dropdown');
const bgInfoBtn = document.getElementById('bg-info-btn');
const engineSwitchToggle = document.getElementById('engine-switch-toggle');
const bgInfoToggle = document.getElementById('bg-info-toggle');
const directJumpToggle = document.getElementById('direct-jump-toggle');
const engineSwitcherCaret = document.getElementById('engine-switcher-caret');
const jumpBubble = document.getElementById('jump-bubble');
const jumpBubbleText = document.getElementById('jump-bubble-text');

// 初始化函数
function init() {
    // 渲染搜索引擎相关UI
    updateSearchEnginesEditor();
    updateSearchEnginesUI();

    // 确保DOM完全加载后再设置事件监听器
    setupEventListeners();

    // 加载设置
    loadSettings();

    // 更新初始状态
    customTitleInput.value = customTitleText;
    updateTitleDisplay();
    
    fetchRepoPath();

    // 初始化标题显示
    customTitleInput.value = customTitleText;
    updateTitleDisplay();

    // 获取必应图片
    if (currentBgType === 'bing') {
        fetchBingImage();
    }

    updateEngineSwitcherVisible();
    updateBgInfoBtnVisible();
    updateEngineSwitcherUI();
    setupEngineSwitcherEvents();
    setSearchEngine(currentEngine); // 保证按钮组和设置面板同步
    setSearchEngineName();
}

// 设置所有事件监听器
function setupEventListeners() {
    // 搜索表单提交
    searchForm.addEventListener('submit', handleSearch);

    // 设置按钮点击
    settingsBtn.addEventListener('click', openSettings);

    // 显示背景信息
    bgInfoBtn.addEventListener('click', showBgInfo);

    // 关闭设置面板
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);

    // 设置面板标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.settings-tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // 移除所有 active 类
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 给当前点击的标签和对应内容添加 active 类
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // 背景类型切换
    bgTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                currentBgType = this.value;
                switchBgType(currentBgType);
                saveSettings(); // Save immediately
            }
        });
    });

    // 搜索引擎切换功能开关
    engineSwitchToggle.addEventListener('change', function () {
        engineSwitchEnabled = this.checked;
        updateEngineSwitcherVisible();
        saveSettings(); // Save immediately
    });

    // 背景信息功能开关
    bgInfoToggle.addEventListener('change', function () {
        bgInfoEnabled = this.checked;
        updateBgInfoBtnVisible();
        saveSettings(); // Save immediately
    });

    // 直接跳转功能开关
    directJumpToggle.addEventListener('change', function () {
        directJumpEnabled = this.checked;
        setSearchEngineName();
        saveSettings(); // Save immediately
    });

    // 背景颜色变化
    bgColorPicker.addEventListener('input', function(e) {
        handleColorChange(e);
        saveSettings(); // Save immediately
    });

    // 背景图片上传 - handleImageUpload already sets the image, but we need to ensure it saves if handleImageUpload succeeds. 
    // handleImageUpload is async via FileReader and calls setBingBg (actually sets background style directly).
    // Let's modify handleImageUpload function itself instead of listener for better control.
    bgImageUpload.addEventListener('change', handleImageUpload);

    // 主题颜色变化
    themeColorPicker.addEventListener('input', function(e) {
        handleThemeColorChange(e);
        saveSettings(); // Save immediately
    });

    // 显示模式切换
    displayModeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                currentDisplayMode = this.value;
                updateDisplayMode();
                saveSettings(); // Save immediately
            }
        });
    });

    // 搜索引擎切换
    searchEngineRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                currentEngine = this.value;
                setSearchEngine(currentEngine); // Ensure UI sync 
                setSearchEngineName();
                saveSettings(); // Save immediately
            }
        });
    });

    // 遮罩透明度调整
    overlayOpacitySlider.addEventListener('input', function () {
        overlayOpacity = parseInt(this.value);
        overlayOpacityValue.textContent = `${overlayOpacity}%`;
        updateOverlayOpacity();
        saveSettings(); // Save immediately
    });

    // 快速链接开关
    quickLinksToggle.addEventListener('change', function () {
        quickLinksEnabled = this.checked;
        updateQuickLinksToggleUI();
        saveSettings(); // Save immediately
    });

    // 添加快速链接- inside addNewLink
    addLinkBtn.addEventListener('click', addNewLink);

    // 添加自定义搜索引擎
    addEngineBtn.addEventListener('click', addNewEngine);

    // 重置设置
    resetSettingsBtn.addEventListener('click', resetSettings);

    // 撤销与恢复
    undoSettingsBtn.addEventListener('click', undoSettings);
    redoSettingsBtn.addEventListener('click', redoSettings);

    // 导出设置
    exportSettingsBtn.addEventListener('click', exportSettings);

    // 导入设置
    importSettingsInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            importFilename.textContent = e.target.files[0].name;
            importSettings(e);
        } else {
            importFilename.textContent = '未选择文件';
        }
    });

    // 标题显示开关
    showTitleToggle.addEventListener('change', function () {
        showTitle = this.checked;
        updateTitleDisplay();
        saveSettings(); // Save immediately
    });

    // 自定义标题输入
    customTitleInput.addEventListener('input', function () {
        customTitleText = this.value;
        updateTitleDisplay();
        saveSettings(); // Save immediately
    });

    // 历史记录开关
    showSearchHistoryToggle.addEventListener('change', function () {
        showSearchHistoryEnabled = this.checked;
        updateSearchHistoryDisplay();
        saveSettings(); // Save immediately
    });

    // 清除搜索历史
    clearSearchHistoryBtn.addEventListener('click', clearSearchHistory);

    // 搜索框聚焦时展示历史
    searchInput.addEventListener('focus', function (e) {
        checkDirectJumpBubble(e.target.value);
        if (e.target.value === '' || e.target.value == undefined || e.target.value == null) showSearchHistory();
        else hideSearchHistory();
    });

    // 输入时也可实时展示（搜索框有字符后收起）
    searchInput.addEventListener('input', function (e) {
        checkDirectJumpBubble(e.target.value);
        if (e.target.value === '' || e.target.value == undefined || e.target.value == null) showSearchHistory();
        else hideSearchHistory();
    });

    // 失焦时隐藏历史
    searchInput.addEventListener('blur', function() {
        hideSearchHistory();
        if (jumpBubble) jumpBubble.classList.add('hidden');
    });

    // 搜索框下方快速切换搜索引擎
    searchEngineQuickRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                setSearchEngine(this.value);
                setSearchEngineName();
                // 同步设置面板
                searchEngineRadios.forEach(r => r.checked = r.value === this.value);
            }
        });
    });

}

// 判断给定主机名是否应该优先使用 http（局域网、IP、localhost、无点名、.local 等）
function needsHttp(host) {
    if (!host) return false;
    host = host.toLowerCase().trim();
    if (host === 'localhost') return true;
    if (host.endsWith('.local')) return true;
    // IPv4（允许端口）
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host)) return true;
    // 常见私有网段
    if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
    // 没有点的短主机名（可能为内网主机名）
    if (host.indexOf('.') === -1) return true;
    return false;
}

function checkDirectJumpBubble(val) {
    const raw = (val || '').trim();
    if (!jumpBubble || !jumpBubbleText) return;
    
    const jumpUrl = checkShouldJumpInfo(raw);
    if (jumpUrl) {
        jumpBubbleText.textContent = jumpUrl;
        jumpBubble.classList.remove('hidden');
    } else {
        jumpBubble.classList.add('hidden');
    }
}

// 提取判断是否应该直接跳转的逻辑
function checkShouldJumpInfo(raw) {
    if (!raw) return null;
    
    // 如果没有启用，则仅对带协议的允许直接跳转
    if (!directJumpEnabled) {
        if (/^https?:\/\//i.test(raw)) return raw;
        return null; // 不跳转
    }

    // 启用了自动跳转，先检查带协议
    if (/^https?:\/\//i.test(raw)) return raw;

    let shouldJump = false;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?(\/.*)?$/;
    const localhostRegex = /^localhost(:\d+)?(\/.*)?$/i;
    const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(?::\d+)?(\/.*)?$/;

    if (ipRegex.test(raw) || localhostRegex.test(raw) || domainRegex.test(raw)) {
        shouldJump = true;
    }

    if (shouldJump) {
        let hostCandidate = raw.split('/')[0];
        hostCandidate = hostCandidate.replace(/^https?:\/\//i, '');
        const proto = needsHttp(hostCandidate) ? 'http' : 'https';
        return `${proto}://${raw}`;
    }
    return null;
}

// 处理搜索提交（支持直接跳转到网址，并对无协议的地址智能选择 http/https）
function handleSearch(e) {
    e.preventDefault();
    const raw = (searchInput.value || '').trim();
    if (!raw) return;

    const jumpUrl = checkShouldJumpInfo(raw);
    if (jumpUrl) {
        window.location.href = jumpUrl;
        return;
    }

    // 不是网址，按搜索引擎搜索
    saveSearchHistory(raw); // 保存历史
    let url = '';
    const engineConf = searchEngines.find(e => e.id === currentEngine) || searchEngines[0] || { url: 'https://www.bing.com/search?q=%s' };
    url = engineConf.url.replace('%s', encodeURIComponent(raw));
    window.location.href = url;
}


// 打开设置面板
function openSettings() {
    settingsOverlay.classList.add('open');
    settingsPanel.classList.add('open');
}

// 关闭设置面板
function closeSettings() {
    settingsOverlay.classList.remove('open');
    settingsPanel.classList.remove('open');
}

// 更新搜索引擎切换按钮显示状态
function updateEngineSwitcherVisible() {
    const container = document.querySelector('.engine-switcher-container');
    if (container) container.style.display = engineSwitchEnabled ? 'flex' : 'none';
}

// 更新背景信息按钮显示状态
function updateBgInfoBtnVisible() {
    if (bgInfoBtn) bgInfoBtn.style.display = bgInfoEnabled ? 'flex' : 'none';
}

// 切换背景类型
function switchBgType(type) {
    bgColorSetting.classList.add('hidden');
    bgImageSetting.classList.add('hidden');

    switch (type) {
        case 'color':
            bgColorSetting.classList.remove('hidden');
            handleColorChange();
            break;
        case 'image':
            bgImageSetting.classList.remove('hidden');
            // 检查是否有保存的图片
            const savedImage = localStorage.getItem('customBgImage');
            if (savedImage) {
                backgroundLayer.style.backgroundImage = `url(${savedImage})`;
                backgroundLayer.style.backgroundSize = 'cover';
                backgroundLayer.style.backgroundPosition = 'center';
                backgroundLayer.style.backgroundRepeat = 'no-repeat';
                imagePreview.src = savedImage;
                imagePreviewContainer.classList.remove('hidden');
            } else {
                backgroundLayer.style.backgroundImage = '';
                imagePreviewContainer.classList.add('hidden');
            }
            break;
        case 'bing':
            fetchBingImage();
            break;
        default:
            fetchBingImage();
            break;
    }
}

// 处理颜色变化
function handleColorChange() {
    backgroundLayer.style.background = bgColorPicker.value;
    backgroundLayer.style.backgroundImage = 'none';
    
    const bgColorHexLabel = document.getElementById('bg-color-hex');
    if (bgColorHexLabel) {
        bgColorHexLabel.textContent = bgColorPicker.value.toUpperCase();
    }
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imageDataUrl = event.target.result;
            backgroundLayer.style.backgroundImage = `url(${imageDataUrl})`;
            backgroundLayer.style.backgroundSize = 'cover';
            backgroundLayer.style.backgroundPosition = 'center';
            backgroundLayer.style.backgroundRepeat = 'no-repeat';

            // 显示预览
            imagePreview.src = imageDataUrl;
            imagePreviewContainer.classList.remove('hidden');

            // 保存到本地存储
            localStorage.setItem('customBgImage', imageDataUrl);
        };
        reader.readAsDataURL(file);
    }
}

// 处理主题颜色变化
function handleThemeColorChange(e) {
    const color = e.target.value;
    currentThemeColor = color;
    document.documentElement.style.setProperty('--theme-color', color);
    
    const themeColorHexLabel = document.getElementById('theme-color-hex');
    if (themeColorHexLabel) {
        themeColorHexLabel.textContent = color.toUpperCase();
    }
    
    // 计算亮度和合适的文本颜色 (对比度)
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    let textColor = brightness > 125 ? '#000000' : '#ffffff';
    document.documentElement.style.setProperty('--theme-text-color', textColor);
}

// 设置搜索引擎
function setSearchEngine(engine) {
    currentEngine = engine;
    searchEngineRadios.forEach(radio => {
        radio.checked = radio.value === engine;
    });
    updateEngineSwitcherUI();
}

// 更新顶部搜索引擎按钮UI
function updateEngineSwitcherUI() {
    if (!engineSwitcherBtn) return;
    const info = searchEngines.find(e => e.id === currentEngine) || searchEngines[0];
    engineSwitcherName.textContent = info ? info.name : '未知';
}

// 顶部搜索引擎切换按钮事件
function setupEngineSwitcherEvents() {
    if (!engineSwitcherBtn) return;
    // 展开/收起下拉
    engineSwitcherBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        engineSwitcherDropdown.classList.toggle('hidden');
        // 切换箭头方向
        if (engineSwitcherDropdown.classList.contains('hidden')) {
            engineSwitcherCaret.classList.remove('fa-caret-up');
            engineSwitcherCaret.classList.add('fa-caret-down');
        } else {
            engineSwitcherCaret.classList.remove('fa-caret-down');
            engineSwitcherCaret.classList.add('fa-caret-up');
        }
    });

    // 点击外部关闭下拉
    document.addEventListener('click', function () {
        engineSwitcherDropdown.classList.add('hidden');
        engineSwitcherCaret.classList.remove('fa-caret-up');
        engineSwitcherCaret.classList.add('fa-caret-down');
    });
}

// 设置搜索引擎提示
function setSearchEngineName() {
    const info = searchEngines.find(e => e.id === currentEngine) || searchEngines[0];
    const engineName = info ? info.name : '';
    let suffix = '……';
    if (directJumpEnabled) {
        suffix = ' 或 直接跳转' + suffix;
    }
    searchInput.placeholder = '在 ' + engineName + ' 中搜索' + suffix;
}

// 更新显示模式
function updateDisplayMode() {
    const html = document.documentElement;
    html.classList.remove('light-mode', 'dark-mode');

    if (currentDisplayMode === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark-mode');
            currentRealDisplayMode = 'dark';
        } else {
            html.classList.add('light-mode');
            currentRealDisplayMode = 'light';
        }
    } else {
        html.classList.add(currentDisplayMode === 'dark' ? 'dark-mode' : 'light-mode');
        currentRealDisplayMode = currentDisplayMode;
    }

    updateOverlayOpacity();
}

// 更新遮罩透明度
function updateOverlayOpacity() {
    overlayOpacitySlider.value = overlayOpacity;
    overlayOpacityValue.textContent = `${overlayOpacity}%`;

    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const baseColor = isDarkMode ? 'rgba(0, 0, 0, ' : 'rgba(255, 255, 255, ';
    overlay.style.backgroundColor = `${baseColor}${overlayOpacity / 100})`;
}

// 更新快速链接开关UI
function updateQuickLinksToggleUI() {
    quickLinksToggle.checked = quickLinksEnabled;
    document.getElementById('quick-links-editor').style.display = quickLinksEnabled ? 'block' : 'none';
    updateQuickLinksDisplay();
}

// 添加新链接
function addNewLink() {
    if (quickLinks.length >= 10) {
        showToast('快速链接数量已达上限');
        return;
    }
    const newLink = {
        id: Date.now(),
        name: '',
        url: ''
    };

    quickLinks.push(newLink);
    updateQuickLinksEditor();
    updateQuickLinksDisplay(); // Update display
    saveSettings(); // Save immediately
}

// 更新快速链接编辑器
function updateQuickLinksEditor() {
    linksList.innerHTML = '';

    quickLinks.forEach((link, index) => {
        let domain = '';
        try {
            const tempUrl = new URL(link.url);
            domain = tempUrl.hostname;
        } catch (e) {
            domain = '';
        }
        const iconUrl = domain ? `https://${domain}/favicon.ico` : '';

        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.innerHTML = `
            <div class="link-item-fields">
                <div style="width: 16px; height: 16px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <img src="${iconUrl}" style="width: 16px; height: 16px; border-radius: 2px;" onerror="this.outerHTML='<i class=\\'fas fa-link\\' style=\\'font-size:14px; color:var(--theme-color);\\'></i>'">
                </div>
                <input type="text" class="link-name" placeholder="名称（选填）" value="${link.name}">
                <input type="url" class="link-url" placeholder="网址（必填）" value="${link.url}">
            </div>
            <div class="link-item-actions">
            <button class="sort-btn-up" data-index="${index}">
                    <i class="fas fa-arrow-up"></i> 
                </button>
                <button class="sort-btn-down" data-index="${index}">
                    <i class="fas fa-arrow-down"></i> 
                </button>
                <button class="delete-link-btn" data-index="${index}">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;

        linksList.appendChild(linkItem);

        // 先获取输入框
        const nameInput = linkItem.querySelector('.link-name');
        const urlInput = linkItem.querySelector('.link-url');

        // 实时更新名称数据
        nameInput.addEventListener('input', function () {
            quickLinks[index].name = this.value;
            saveSettings(); // Save immediately
            updateQuickLinksDisplay(); // Live update main view
        });

        // 实时更新网址数据
        urlInput.addEventListener('input', function () {
            quickLinks[index].url = this.value;
            saveSettings(); // Save immediately
            updateQuickLinksDisplay(); // Live update main view
        });

        // 失焦时自动补全HTTPS协议
        urlInput.addEventListener('blur', function () {
            let val = this.value.trim();
            if (!val) return;
            // 如果已经有 http:// 或 https://，不处理
            if (/^https?:\/\//i.test(val)) return;
            // 简单判断是否为网址格式（有点号且无空格）或 ip/localhost
            if (/^[^\s]+\.[^\s]+$/.test(val) || /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(val) || /^localhost(:\d+)?$/i.test(val)) {
                const hostCandidate = val.split('/')[0];
                const proto = needsHttp(hostCandidate) ? 'http' : 'https';
                this.value = `${proto}://${val}`;
                quickLinks[index].url = this.value;
                saveSettings(); // Save updated URL
                updateQuickLinksDisplay();
            }
        });

        // 添加删除事件监听器
        const deleteBtn = linkItem.querySelector('.delete-link-btn');
        deleteBtn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            quickLinks.splice(idx, 1);
            updateQuickLinksEditor();
            updateQuickLinksDisplay();
            saveSettings(); // Save immediately
        });

        // 添加上移事件监听器
        const sortBtnUp = linkItem.querySelector('.sort-btn-up');
        sortBtnUp.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            if (idx > 0) {
                const temp = quickLinks[idx - 1];
                quickLinks[idx - 1] = quickLinks[idx];
                quickLinks[idx] = temp;
                updateQuickLinksEditor();
                updateQuickLinksDisplay();
                saveSettings(); // Save immediately
            } else showToast('已经是第一个快速链接了');
        });

        // 添加下移事件监听器
        const sortBtnDown = linkItem.querySelector('.sort-btn-down');
        sortBtnDown.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            if (idx < quickLinks.length - 1) {
                const temp = quickLinks[idx + 1];
                quickLinks[idx + 1] = quickLinks[idx];
                quickLinks[idx] = temp;
                updateQuickLinksEditor();
                updateQuickLinksDisplay();
                saveSettings(); // Save immediately
            } else showToast('已经是最后一个快速链接了');
        });



        // 保持滚动位置在底部
        linksList.scrollTop = linksList.scrollHeight;
    });
}

// 更新快速链接显示
function updateQuickLinksDisplay() {
    quickLinksContainer.innerHTML = '';

    if (quickLinksEnabled && quickLinks.length > 0) {
        quickLinks.forEach(link => {
            if (link.url) {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.target = '_blank';
                linkElement.className = 'quick-link';

                // 获取网站域名用于favicon
                let domain = '';
                try {
                    const url = new URL(link.url);
                    domain = url.hostname;
                } catch (e) {
                    domain = '';
                }

                // 创建图标容器
                const iconContainer = document.createElement('div');
                iconContainer.className = 'quick-link-icon-container';

                // 创建favicon img元素
                const faviconImg = document.createElement('img');
                faviconImg.src = domain ? `https://${domain}/favicon.ico` : '';
                faviconImg.alt = link.name;
                faviconImg.className = 'quick-link-favicon';
                faviconImg.onerror = function () {
                    // 如果favicon加载失败，显示默认图标
                    this.style.display = 'none';
                    iconContainer.innerHTML += '<i class="fas fa-link quick-link-default-icon"></i>';
                };

                iconContainer.appendChild(faviconImg);

                // 创建文本元素
                const textElement = document.createElement('span');
                textElement.className = 'quick-link-text';
                textElement.textContent = link.name;

                linkElement.appendChild(iconContainer);
                linkElement.appendChild(textElement);
                quickLinksContainer.appendChild(linkElement);
            }
        });
    }
}

// 动态渲染搜索引擎UI（单选组和下拉选项）
function updateSearchEnginesUI() {
    // 渲染管理面板的单选
    const radioGroup = document.getElementById('search-engine-radio-group');
    if (radioGroup) {
        radioGroup.innerHTML = '';
        searchEngines.forEach(engine => {
            const label = document.createElement('label');
            label.className = 'radio-item';
            label.innerHTML = `
                <input type="radio" name="search-engine" value="${engine.id}" ${currentEngine === engine.id ? 'checked' : ''}>
                <span>${engine.name}</span>
            `;
            radioGroup.appendChild(label);
        });
        
        // 重新绑定事件
        searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
        searchEngineRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                setSearchEngine(this.value);
                setSearchEngineName();
                saveSettings(); // Save engine choice immediately
            });
        });
    }

    // 渲染下拉
    if (engineSwitcherDropdown) {
        engineSwitcherDropdown.innerHTML = '';
        searchEngines.forEach(engine => {
            const opt = document.createElement('div');
            opt.className = 'engine-option';
            opt.setAttribute('data-engine', engine.id);

            // 获取网站域名用于favicon
            let domain = '';
            try {
                const url = new URL(engine.url.replace('%s', ''));
                domain = url.hostname;
            } catch (e) {
                domain = '';
            }
            const iconUrl = domain ? `https://${domain}/favicon.ico` : '';

            opt.innerHTML = `<img src="${iconUrl}" style="width:16px;height:16px;border-radius:2px;" onerror="this.outerHTML='<i class=\\'fas fa-globe\\' style=\\'font-size:16px; color:#888; width:16px; height:16px; display:flex; align-items:center; justify-content:center;\\'></i>'"><span>${engine.name}</span>`;
            
            opt.addEventListener('click', function () {
                const engineId = this.getAttribute('data-engine');
                setSearchEngine(engineId);
                setSearchEngineName();
                updateEngineSwitcherUI();
                engineSwitcherDropdown.classList.add('hidden');
                
                // 同步设置面板并保存
                searchEngineRadios.forEach(r => r.checked = r.value === engineId);
                searchEngineQuickRadios.forEach(r => r.checked = r.value === engineId);
                saveSettings();
                
                // 收起时箭头恢复向下
                engineSwitcherCaret.classList.remove('fa-caret-up');
                engineSwitcherCaret.classList.add('fa-caret-down');
            });
            engineSwitcherDropdown.appendChild(opt);
        });
    }
    updateEngineSwitcherUI();
}

// 动态渲染管理搜索引擎引擎列表
function updateSearchEnginesEditor() {
    if (!enginesList) return;
    enginesList.innerHTML = '';
    searchEngines.forEach((engine, index) => {
        let domain = '';
        try {
            const url = new URL(engine.url.replace('%s', ''));
            domain = url.hostname;
        } catch (e) {
            domain = '';
        }
        const iconUrl = domain ? `https://${domain}/favicon.ico` : '';

        const item = document.createElement('div');
        item.className = 'link-item';
        item.innerHTML = `
            <div class="link-item-fields">
                <div style="width: 16px; height: 16px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                    <img src="${iconUrl}" style="width: 16px; height: 16px; border-radius: 2px;" onerror="this.outerHTML='<i class=\\'fas fa-globe\\' style=\\'font-size:14px; color:#888;\\'></i>'">
                </div>
                <input type="text" class="engine-name" placeholder="搜索引擎名称" value="${engine.name}">
                <input type="url" class="engine-url" placeholder="网址（形如：https://xxx.com/search?q=%s）" value="${engine.url}">
            </div>
            <div class="link-item-actions">
                <button class="sort-btn-up" data-index="${index}"><i class="fas fa-arrow-up"></i></button>
                <button class="sort-btn-down" data-index="${index}"><i class="fas fa-arrow-down"></i></button>
                <button class="delete-link-btn" data-index="${index}"><i class="fas fa-trash"></i> 删除</button>
            </div>
        `;
        enginesList.appendChild(item);

        const nameInput = item.querySelector('.engine-name');
        const urlInput = item.querySelector('.engine-url');

        nameInput.addEventListener('input', function () {
            searchEngines[index].name = this.value;
            saveSettings();
            updateSearchEnginesUI();
        });

        urlInput.addEventListener('input', function () {
            searchEngines[index].url = this.value;
            saveSettings();
            updateSearchEnginesUI();
        });

        // 删除
        const deleteBtn = item.querySelector('.delete-link-btn');
        deleteBtn.addEventListener('click', function () {
            if (searchEngines.length <= 1) {
                showToast('至少需保留一个搜索引擎');
                return;
            }
            const idx = parseInt(this.getAttribute('data-index'));
            searchEngines.splice(idx, 1);
            // 如果删除了当前选中的
            if (!searchEngines.find(e => e.id === currentEngine)) {
                currentEngine = searchEngines[0].id;
            }
            updateSearchEnginesEditor();
            updateSearchEnginesUI();
            setSearchEngine(currentEngine);
            setSearchEngineName();
            saveSettings();
        });

        // 上移
        const sortBtnUp = item.querySelector('.sort-btn-up');
        sortBtnUp.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            if (idx > 0) {
                const temp = searchEngines[idx - 1];
                searchEngines[idx - 1] = searchEngines[idx];
                searchEngines[idx] = temp;
                updateSearchEnginesEditor();
                updateSearchEnginesUI();
                saveSettings();
            } else showToast('已经是第一个了');
        });

        // 下移
        const sortBtnDown = item.querySelector('.sort-btn-down');
        sortBtnDown.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            if (idx < searchEngines.length - 1) {
                const temp = searchEngines[idx + 1];
                searchEngines[idx + 1] = searchEngines[idx];
                searchEngines[idx] = temp;
                updateSearchEnginesEditor();
                updateSearchEnginesUI();
                saveSettings();
            } else showToast('已经是最后一个了');
        });
    });
}

function addNewEngine() {
    const newEngine = {
        id: 'engine_' + Date.now(),
        name: '自定义引擎',
        url: ''
    };
    searchEngines.push(newEngine);
    updateSearchEnginesEditor();
    updateSearchEnginesUI();
    saveSettings();
    enginesList.scrollTop = enginesList.scrollHeight;
}

// 更新标题显示
function updateTitleDisplay() {
    titleArea.style.display = showTitle ? 'flex' : 'none';
    customTitle.textContent = customTitleText || '';
}

// 显示提示框
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// 获取必应图片（带本地缓存）
function fetchBingImage() {
    const cache = JSON.parse(localStorage.getItem('bingBgCache') || '{}');
    const today = new Date().toISOString().slice(0, 10);

    // 优先显示最近一次缓存的图片（不管日期）
    if (cache.url) {
        setBingBg(cache.url);
        if (cache.desc) {
            bingImageInfo = {
                desc: cache.desc || '',
                url: cache.url
            };
        }
    }

    // 如果处于撤销或恢复操作中，或者今天已经成功拉取并缓存过有效图片，则不再发起新的异步请求。
    // 这避免了因为一些支持随机返回的API导致每次撤销/刷新都跳变图片。
    if ((isUndoRedoOperation && cache.url) || (cache.date === today && cache.url)) {
        return;
    }

    // 异步请求最新图片
    fetch('https://bing.biturl.top/')
        .then(response => response.json())
        .then(data => {
            if (data && data.url) {
                // 如果是新的一天，或者图片发生变化，才更新缓存和页面
                if (cache.date !== today || cache.url !== data.url) {
                    // 预加载图片，加载完成后再切换背景
                    const img = new Image();
                    img.onload = function () {
                        setBingBg(data.url);
                    };
                    img.src = data.url;

                    bingImageInfo = {
                        desc: data.copyright || '',
                        url: data.url
                    };
                    // 缓存到本地
                    localStorage.setItem('bingBgCache', JSON.stringify({
                        date: today,
                        url: data.url,
                        desc: data.copyright || ''
                    }));
                }
            }
        })
        .catch(error => {
            console.error('获取必应图片失败:', error);
        });
}

// 设置背景图片
function setBingBg(imageUrl) {
    backgroundLayer.style.backgroundImage = `url(${imageUrl})`;
    backgroundLayer.style.backgroundSize = 'cover';
    backgroundLayer.style.backgroundPosition = 'center';
    backgroundLayer.style.backgroundRepeat = 'no-repeat';
}

// 展示背景信息（HTML）
function showBgInfo() {
    let msg = '';
    if (currentBgType === 'bing') {
        msg = `<b>每日一图</b><br><br>`;
        if (bingImageInfo.desc) {
            // 拆分描述和版权
            const match = bingImageInfo.desc.match(/^(.*?)(（|\()(.+?)(）|\))$/);
            if (match) {
                // match[1]：描述，match[3]：版权
                msg += `${match[1].trim()}<br><span style="color:#888;font-size:0.98em;">${match[3].trim()}<br>Microsoft Bing</span>`;
            } else {
                msg += bingImageInfo.desc;
            }
        } else {
            msg += '暂无图片信息';
        }
    } else if (currentBgType === 'color') {
        // 获取当前背景色
        let color = bgColorPicker.value;
        // 转为RGB
        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const num = parseInt(hex, 16);
            return `RGB(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255})`;
        }
        msg = `<b>纯色背景</b><br><br>十六进制颜色：${color}<br>RGB颜色：${hexToRgb(color)}`;
    } else if (currentBgType === 'image') {
        let img = localStorage.getItem('customBgImage');
        if (img) {
            // 只显示前30字符，避免太长
            const shortUrl = img.slice(0, 30) + '...';
            msg = `<b>图片背景</b><br><br>
            <img src="${img}" alt="本地图片" style="max-width:180px;max-height:80px;display:block;margin:0 auto 10px auto;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);"><br>
            <span style="font-size:0.95em;color:#888;">DataURL: ${shortUrl}</span>`;
        } else {
            msg = `<b>图片背景</b><br><br>暂无图片`;
        }
    }
    showCustomModal(msg);
}

// 自定义弹窗，展示背景信息
function showCustomModal(html) {
    const modal = document.getElementById('custom-modal');
    const msg = document.getElementById('custom-modal-message');
    const okBtn = document.getElementById('custom-modal-ok');
    const cancelBtn = document.getElementById('custom-modal-cancel');

    msg.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.remove('is-closing');
    cancelBtn.style.display = 'none'; // 只显示确定按钮

    function cleanup() {
        okBtn.onclick = null;
        modal.classList.add('is-closing');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('is-closing');
            cancelBtn.style.display = ''; // 恢复
        }, 300);
    }

    okBtn.onclick = cleanup;
}

// 获取搜索历史
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

// 保存搜索历史
function saveSearchHistory(keyword) {
    if (!keyword) return;
    let history = getSearchHistory();
    history = history.filter(item => item !== keyword); // 去重
    history.unshift(keyword);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

// 隐藏搜索历史
function hideSearchHistory() {
    const list = document.getElementById('search-history-list');
    if (list) {
        list.classList.remove('active');
    }
    updateSearchInputContainerBackground('blur');
}

// 清除搜索历史
function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    hideSearchHistory();
    showToast('搜索历史已清除');
}

// 显示搜索历史
function showSearchHistory() {
    if (!showSearchHistoryEnabled) {
        hideSearchHistory();
        return;
    }
    const history = getSearchHistory();
    const list = document.getElementById('search-history-list');
    if (!list) return;
    if (history.length === 0) {
        list.classList.remove('active');
        updateSearchInputContainerBackground('blur');
        return;
    }
    
    list.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        
        // 阻止点击空白处导致失去焦点
        div.onmousedown = (e) => {
            if (e.target === div) {
                e.preventDefault();
            }
        };

        // 历史文本
        const textSpan = document.createElement('span');
        textSpan.textContent = item;
        textSpan.style.flex = '1';
        textSpan.style.cursor = 'pointer';

        // 点击历史文本进行搜索
        textSpan.onmousedown = (e) => {
            e.preventDefault(); // 防止输入框失去焦点
            // 先把该项保存到历史顶部，确保顺序更新
            saveSearchHistory(item);

            searchInput.value = item;
            const list = document.getElementById('search-history-list');
            if (list) list.classList.remove('active');
            updateSearchInputContainerBackground('blur');
            const query = item.trim();
            if (query) {
                const engineConf = searchEngines.find(e => e.id === currentEngine) || searchEngines[0] || { url: 'https://www.bing.com/search?q=%s' };
                let url = engineConf.url.replace('%s', encodeURIComponent(query));
                window.location.href = url;
            }
            // 不再调用 searchInput.blur()，避免触发额外隐藏逻辑导致问题
        };

        // 删除按钮
        const delBtn = document.createElement('span');
        delBtn.textContent = '✕';
        delBtn.title = '删除该条历史记录';
        delBtn.style.marginLeft = '10px';
        delBtn.style.color = '#888';
        delBtn.style.cursor = 'pointer';
        delBtn.onmousedown = (e) => {
            e.preventDefault(); // 防止输入框失去焦点
            e.stopPropagation();
            // 删除该条历史
            let historyArr = getSearchHistory();
            historyArr = historyArr.filter(h => h !== item);
            localStorage.setItem('searchHistory', JSON.stringify(historyArr));
            updateSearchInputContainerBackground('focus');
            updateSearchHistoryDisplay();
            showToast('已删除该条历史记录');
        };

        div.appendChild(textSpan);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
    list.classList.add('active');
    updateSearchInputContainerBackground('focus');
}

// 更新搜索历史显示
function updateSearchHistoryDisplay() {
    showSearchHistory();
}

// 更新搜索输入框背景
function updateSearchInputContainerBackground(e) {
    // Background and shadow logic is now handled by pure modern CSS
}

// 设置搜索引擎并同步单选框
function setSearchEngine(engine) {
    currentEngine = engine;
    searchEngineRadios.forEach(radio => {
        radio.checked = radio.value === engine;
    });
    // 同步搜索框下方按钮组
    searchEngineQuickRadios.forEach(radio => {
        radio.checked = radio.value === engine;
    });
}

// 自定义确认对话框
function customConfirm(message, onOk, onCancel) {
    const modal = document.getElementById('custom-modal');
    const msg = document.getElementById('custom-modal-message');
    const okBtn = document.getElementById('custom-modal-ok');
    const cancelBtn = document.getElementById('custom-modal-cancel');

    msg.textContent = message;
    modal.classList.remove('hidden');
    modal.classList.remove('is-closing');

    function cleanup() {
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.classList.add('is-closing');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('is-closing');
        }, 300);
    }

    okBtn.onclick = () => {
        cleanup();
        if (onOk) onOk();
    };
    cancelBtn.onclick = () => {
        cleanup();
        if (onCancel) onCancel();
    };
}

function fetchRepoPath() {
    fetch('https://api.starplex.top/data/puretab.json')
        .then(res => res.json())
        .then(data => {
            if (data && data.repository_path) {
                const repoLink = document.getElementById('repo-link');
                if (repoLink) repoLink.href = data.repository_path;
            }
        })
        .catch(err => console.error('获取仓库地址失败', err));
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
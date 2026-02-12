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
let isRemovingHistory = false;
let settingsBackup = null; // 用于重置设置时的备份
let engineSwitchEnabled = true;
let bgInfoEnabled = true;
let directJumpEnabled = false;

// 主题色变量
const lightBg = '#ffffff';
const darkBg = '#1a1a1a';

// 存储必应图片信息
let bingImageInfo = {
    desc: '',
    url: ''
};

// 搜索引擎信息映射
const ENGINE_INFO = {
    google: { name: 'Google', icon: '<i class="fab fa-google"></i>' },
    bing: { name: 'Bing', icon: '<i class="fab fa-microsoft"></i>' },
    yandex: { name: 'Yandex', icon: '<i class="fab fa-yandex"></i>' },
    baidu: { name: 'Baidu', icon: '<i class="fas fa-globe"></i>' }
};

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
const themeColorPreview = document.getElementById('theme-color-preview');
const displayModeRadios = document.querySelectorAll('input[name="display-mode"]');
const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
const overlayOpacitySlider = document.getElementById('overlay-opacity');
const overlayOpacityValue = document.querySelector('.opacity-value');
const quickLinksToggle = document.getElementById('quick-links-toggle');
const quickLinksContainer = document.getElementById('quick-links-container');
const linksList = document.getElementById('links-list');
const addLinkBtn = document.getElementById('add-link-btn');
const resetSettingsBtn = document.getElementById('reset-settings');
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
const searchEngineQuickRadios = document.querySelectorAll('input[name="search-engine-quick"]');
const engineSwitcherBtn = document.getElementById('engine-switcher-btn');
const engineSwitcherName = document.getElementById('engine-switcher-name');
const engineSwitcherDropdown = document.getElementById('engine-switcher-dropdown');
const bgInfoBtn = document.getElementById('bg-info-btn');
const engineSwitchToggle = document.getElementById('engine-switch-toggle');
const bgInfoToggle = document.getElementById('bg-info-toggle');
const directJumpToggle = document.getElementById('direct-jump-toggle');
const engineSwitcherCaret = document.getElementById('engine-switcher-caret');

// 初始化函数
function init() {
    // 确保DOM完全加载后再设置事件监听器
    setupEventListeners();

    // 加载设置
    loadSettings();

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

    // 重置设置
    resetSettingsBtn.addEventListener('click', resetSettings);

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
        isRemovingHistory = false;
        if (e.target.value === '' || e.target.value == undefined || e.target.value == null) showSearchHistory();
        else hideSearchHistory();
    });

    // 输入时也可实时展示（搜索框有字符后收起）
    searchInput.addEventListener('input', function (e) {
        isRemovingHistory = false;
        if (e.target.value === '' || e.target.value == undefined || e.target.value == null) showSearchHistory();
        else hideSearchHistory();
    });

    // 失焦时隐藏历史
    searchInput.addEventListener('blur', hideSearchHistory);

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

// 处理搜索提交（支持直接跳转到网址，并对无协议的地址智能选择 http/https）
function handleSearch(e) {
    e.preventDefault();
    const raw = (searchInput.value || '').trim();
    if (!raw) return;

    // 已带协议的直接使用（保持用户输入意图），不受设置限制
    if (/^https?:\/\//i.test(raw)) {
        window.location.href = raw;
        return;
    }

    // 判断是否应该直接跳转
    let shouldJump = false;
    
    // 只有在启用设置时才进行智能识别
    if (directJumpEnabled) {
        // 识别 IPv4 地址 (X.X.X.X[:port])
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?(\/.*)?$/;
        
        // 识别 localhost
        const localhostRegex = /^localhost(:\d+)?(\/.*)?$/i;
        
        // 识别标准域名 (xxx.xx.xx)
        // 要求至少包含一个点，且顶级域名至少2个字母
        // 排除纯数字或非标准字符
        const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(?::\d+)?(\/.*)?$/;

        if (ipRegex.test(raw) || localhostRegex.test(raw) || domainRegex.test(raw)) {
            shouldJump = true;
        }
    }

    if (shouldJump) {
        // 取出 hostCandidate（raw 的主机部分）
        let hostCandidate = raw.split('/')[0];
        // 如果包含 scheme-like 前缀（极少情况），移除
        hostCandidate = hostCandidate.replace(/^https?:\/\//i, '');
        // 选择协议
        const proto = needsHttp(hostCandidate) ? 'http' : 'https';
        const url = `${proto}://${raw}`;
        window.location.href = url;
        return;
    }

    // 不是网址，按搜索引擎搜索
    saveSearchHistory(raw); // 保存历史
    let url = '';
    switch (currentEngine) {
        case 'google':
            url = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
            break;
        case 'bing':
            url = `https://www.bing.com/search?q=${encodeURIComponent(raw)}`;
            break;
        case 'yandex':
            url = `https://yandex.com/search/?text=${encodeURIComponent(raw)}`;
            break;
        case 'baidu':
            url = `https://www.baidu.com/s?wd=${encodeURIComponent(raw)}`;
            break;
        default:
            url = `https://www.bing.com/search?q=${encodeURIComponent(raw)}`;
    }
    window.location.href = url;
}


// 打开设置面板
function openSettings() {
    settingsOverlay.classList.remove('hidden');
    settingsPanel.classList.remove('hidden');
    // 添加动画效果
    setTimeout(() => {
        settingsOverlay.style.opacity = '1';
        settingsPanel.style.transform = 'translateX(0)';
    }, 10);
}

// 关闭设置面板
function closeSettings() {
    settingsOverlay.style.opacity = '0';
    settingsPanel.style.transform = 'translateX(100%)';

    // 动画结束后隐藏元素
    setTimeout(() => {
        settingsOverlay.classList.add('hidden');
        settingsPanel.classList.add('hidden');
    }, 300);
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
        default:
            fetchBingImage();
            break;
    }
}

// 处理颜色变化
function handleColorChange() {
    backgroundLayer.style.background = bgColorPicker.value;
    backgroundLayer.style.backgroundImage = 'none';
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
    // themeColorPreview.style.background = color;
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
    const info = ENGINE_INFO[currentEngine] || ENGINE_INFO.bing;
    engineSwitcherName.textContent = info.name;
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
    // 选项点击
    engineSwitcherDropdown.querySelectorAll('.engine-option').forEach(opt => {
        opt.addEventListener('click', function () {
            const engine = this.getAttribute('data-engine');
            setSearchEngine(engine);
            setSearchEngineName();
            updateEngineSwitcherUI();
            engineSwitcherDropdown.classList.add('hidden');
            // 同步设置面板
            searchEngineRadios.forEach(r => r.checked = r.value === engine);
            // 收起时箭头恢复向下
            engineSwitcherCaret.classList.remove('fa-caret-up');
            engineSwitcherCaret.classList.add('fa-caret-down');
        });
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
    searchInput.placeholder = '在 ' + currentEngine.charAt(0).toUpperCase() + currentEngine.slice(1) + ' 中搜索……';
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
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.innerHTML = `
            <div class="link-item-fields">
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
    cancelBtn.style.display = 'none'; // 只显示确定按钮

    function cleanup() {
        okBtn.onclick = null;
        modal.classList.add('hidden');
        cancelBtn.style.display = ''; // 恢复
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
    // 延迟隐藏，以便点击历史记录项的事件能被触发
    setTimeout(() => {
        // 清除单条历史记录时不隐藏
        if (isRemovingHistory) {
            searchInput.focus();
            return;
        }

        const list = document.getElementById('search-history-list');
        if (list) {
            list.classList.remove('active');
        }
        updateSearchInputContainerBackground('blur');
    }, 200);
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
    isRemovingHistory = false; // 重置是否点击了✕的状态
    list.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';

        // 历史文本
        const textSpan = document.createElement('span');
        textSpan.textContent = item;
        textSpan.style.flex = '1';
        textSpan.style.cursor = 'pointer';

        // 点击历史文本进行搜索
        textSpan.onmousedown = () => {
            // 先把该项保存到历史顶部，确保顺序更新
            saveSearchHistory(item);

            searchInput.value = item;
            const list = document.getElementById('search-history-list');
            if (list) list.classList.remove('active');
            updateSearchInputContainerBackground('blur');
            const query = item.trim();
            if (query) {
                let url = '';
                switch (currentEngine) {
                    case 'google':
                        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                        break;
                    case 'bing':
                        url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                        break;
                    case 'yandex':
                        url = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
                        break;
                    case 'baidu':
                        url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                        break;
                    default:
                        url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                }
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
            e.stopPropagation();
            // 删除该条历史
            let historyArr = getSearchHistory();
            historyArr = historyArr.filter(h => h !== item);
            localStorage.setItem('searchHistory', JSON.stringify(historyArr));
            isRemovingHistory = true; // 点击了✕的状态改为真
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
    const history = getSearchHistory();
    const list = document.getElementById('search-history-list');
    if (!list) return;

    list.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item;
        list.appendChild(div);
    });
}

// 更新搜索输入框背景
function updateSearchInputContainerBackground(e) {
    if (e === 'focus') {
        showSearchInputContainer.style.boxShadow = '0 -2px 1px #969696';
        if (currentRealDisplayMode === 'dark') showSearchInputContainer.style.backgroundColor = darkBg;
        else if (currentRealDisplayMode === 'light') showSearchInputContainer.style.backgroundColor = lightBg;
    } else if (e === 'blur') {
        showSearchInputContainer.style.backgroundColor = 'transparent';
        showSearchInputContainer.style.boxShadow = 'none';
    }
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

    function cleanup() {
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.classList.add('hidden');
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
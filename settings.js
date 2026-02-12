// 保存设置到本地存储
function saveSettings() {
    const settings = {
        searchEngine: currentEngine,
        bgType: currentBgType,
        bgColor: bgColorPicker.value,
        themeColor: currentThemeColor,
        displayMode: currentDisplayMode,
        overlayOpacity: overlayOpacity,
        quickLinksEnabled: quickLinksEnabled,
        quickLinks: quickLinks,
        showTitle: showTitle,
        customTitleText: customTitleText,
        showSearchHistoryEnabled: showSearchHistoryEnabled,
        engineSwitchEnabled: engineSwitchEnabled,
        bgInfoEnabled: bgInfoEnabled,
        directJumpEnabled: directJumpEnabled
    };
    localStorage.setItem('searchPageSettings', JSON.stringify(settings));
}

// 从本地存储加载设置
function loadSettings() {
    const savedSettings = localStorage.getItem('searchPageSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        // 加载搜索引擎设置
        if (settings.searchEngine) {
            setSearchEngine(settings.searchEngine);
            // 设置搜索引擎类型单选框选中
            searchEngineRadios.forEach(radio => {
                radio.checked = radio.value === settings.searchEngine;
            });
        }

        // 加载显示搜索历史记录开关
        if (settings.showSearchHistoryEnabled !== undefined) {
            showSearchHistoryEnabled = settings.showSearchHistoryEnabled;
            showSearchHistoryToggle.checked = showSearchHistoryEnabled;
        }

        // 加载背景设置
        if (settings.bgType) {
            currentBgType = settings.bgType;
            switchBgType(currentBgType);

            // 加载背景颜色
            if (settings.bgColor) {
                bgColorPicker.value = settings.bgColor;
                if (currentBgType === 'color') {
                    handleColorChange();
                }

            }

            // 加载本地背景图片
            const savedImage = localStorage.getItem('customBgImage');
            if (savedImage && currentBgType === 'image') {
                backgroundLayer.style.backgroundImage = `url(${savedImage})`;
                backgroundLayer.style.backgroundSize = 'cover';
                backgroundLayer.style.backgroundPosition = 'center';
                backgroundLayer.style.backgroundRepeat = 'no-repeat';

                // 显示预览
                imagePreview.src = savedImage;
                imagePreviewContainer.classList.remove('hidden');
            }

            // 加载必应背景图片
            const bingImage = localStorage.getItem('bingBgImage');
            if (bingImage && currentBgType === 'bing') {
                backgroundLayer.style.backgroundImage = `url(${bingImage})`;
                backgroundLayer.style.backgroundSize = 'cover';
                backgroundLayer.style.backgroundPosition = 'center';
                backgroundLayer.style.backgroundRepeat = 'no-repeat';
            }

            // 设置背景类型单选框选中
            bgTypeRadios.forEach(radio => {
                radio.checked = radio.value === currentBgType;
            });

        }

        // 加载主题色设置
        if (settings.themeColor) {
            currentThemeColor = settings.themeColor;
            themeColorPicker.value = settings.themeColor;
            document.documentElement.style.setProperty('--theme-color', settings.themeColor);
            // themeColorPreview.style.background = settings.themeColor;
        }

        // 加载显示模式
        if (settings.displayMode) {
            currentDisplayMode = settings.displayMode;
            displayModeRadios.forEach(radio => {
                radio.checked = radio.value === currentDisplayMode;
            });
            updateDisplayMode();
        }

        // 加载遮罩透明度
        if (settings.overlayOpacity !== undefined) {
            overlayOpacity = settings.overlayOpacity;
            updateOverlayOpacity();
        }

        // 加载快速链接设置
        if (typeof settings.quickLinksEnabled !== 'undefined') {
            quickLinksEnabled = settings.quickLinksEnabled;
            quickLinksToggle.checked = quickLinksEnabled;
            updateQuickLinksToggleUI();
        }

        if (Array.isArray(settings.quickLinks)) {
            quickLinks = settings.quickLinks;
        }

        // 加载标题设置
        if (settings.showTitle !== undefined) {
            showTitle = settings.showTitle;
            showTitleToggle.checked = showTitle;
        }

        // 加载自定义标题文本
        if (settings.customTitleText) {
            customTitleText = settings.customTitleText;
            customTitleInput.value = customTitleText;
        }

        // 加载搜索引擎切换器设置
        if (settings.engineSwitchEnabled !== undefined) {
            engineSwitchEnabled = settings.engineSwitchEnabled;
            engineSwitchToggle.checked = engineSwitchEnabled;
            updateEngineSwitcherVisible();
        }

        // 加载必应图片信息显示设置
        if (settings.bgInfoEnabled !== undefined) {
            bgInfoEnabled = settings.bgInfoEnabled;
            bgInfoToggle.checked = bgInfoEnabled;
            updateBgInfoBtnVisible();
        }

        // 加载直接跳转设置
        if (settings.directJumpEnabled !== undefined) {
            directJumpEnabled = settings.directJumpEnabled;
            directJumpToggle.checked = directJumpEnabled;
        }

        updateTitleDisplay();
        setSearchEngineName();
    } else {
        // 默认设置
        setSearchEngine('bing');
        switchBgType('bing');
        themeColorPicker.value = '#2780BB';
        handleThemeColorChange({ target: { value: '#2780BB' } });

        // 默认显示模式跟随系统
        currentDisplayMode = 'system';
        displayModeRadios.forEach(radio => {
            if (radio.value === 'system') radio.checked = true;
        });

        // 默认遮罩透明度
        overlayOpacity = 30;
        updateOverlayOpacity();

        // 默认快速链接设置 - 初始为空
        quickLinksEnabled = true;
        quickLinksToggle.checked = true;
        updateQuickLinksToggleUI();
        quickLinks = [];

        // 默认标题设置
        showTitle = true;
        showTitleToggle.checked = true;
        customTitleText = '';
        customTitleInput.value = '';

        // 默认显示历史记录
        showSearchHistoryEnabled = true;
        showSearchHistoryToggle.checked = true;

        engineSwitchEnabled = true;
        bgInfoEnabled = true;
        engineSwitchToggle.checked = true;
        bgInfoToggle.checked = true;

        directJumpEnabled = false;
        directJumpToggle.checked = false;

        updateTitleDisplay();
        setSearchEngineName();
    }

    // 应用加载的设置
    updateDisplayMode();
    updateQuickLinksDisplay();
    updateQuickLinksEditor();
}

// 重置设置为默认值
function resetSettings() {
    customConfirm('确定要重置所有设置吗？', () => {
        // 清除本地存储
        localStorage.removeItem('searchPageSettings');
        localStorage.removeItem('customBgImage');
        // localStorage.removeItem('bingBgImage');

        // 重置变量
        currentEngine = 'bing';
        currentBgType = 'bing';
        currentThemeColor = '#2780BB';
        currentDisplayMode = 'system';
        overlayOpacity = 30;
        quickLinksEnabled = true;
        quickLinks = [];
        showTitle = true;
        customTitleText = '星函标签页';
        showSearchHistoryEnabled = true;
        engineSwitchEnabled = true;
        bgInfoEnabled = true;
        engineSwitchToggle.checked = true;
        bgInfoToggle.checked = true;
        
        directJumpEnabled = false;
        directJumpToggle.checked = false;

        // 重置UI
        setSearchEngine('bing');
        switchBgType('bing');
        themeColorPicker.value = '#2780BB';
        handleThemeColorChange({ target: { value: '#2780BB' } });

        displayModeRadios.forEach(radio => {
            radio.checked = radio.value === 'system';
        });

        // 设置背景类型单选框选中
        bgTypeRadios.forEach(radio => {
            radio.checked = radio.value === 'bing';
        });

        // 设置搜索引擎类型单选框选中
        searchEngineRadios.forEach(radio => {
            radio.checked = radio.value === 'bing';
        });

        // 设置搜索引擎提示
        setSearchEngineName();

        // 更新搜索引擎切换器UI
        updateEngineSwitcherUI();

        quickLinksToggle.checked = true;
        updateQuickLinksToggleUI();

        backgroundLayer.style.backgroundImage = '';
        backgroundLayer.style.background = '';
        imagePreviewContainer.classList.add('hidden');
        bgImageUpload.value = '';

        // 标题设置重置
        showTitleToggle.checked = true;
        customTitleInput.value = '星函标签页';
        updateTitleDisplay();

        // 显示搜索历史设置重置
        showSearchHistoryToggle.checked = true;

        // 应用默认主题
        updateDisplayMode();

        // 刷新必应图片
        fetchBingImage();

        // 更新链接编辑器
        updateQuickLinksEditor();

        // 更新搜索引擎切换器
        updateEngineSwitcherVisible();

        // 更新必应图片信息显示
        updateBgInfoBtnVisible();

        // 保存重置后的设置
        saveSettings();

        // 显示提示
        showToast('已重置为默认设置');

        // 清空备份并关闭面板，防止被预览机制还原
        settingsBackup = null;

        //收起设置面板
        closeSettings();
    });
}

// 导出设置
function exportSettings() {
    // 获取当前设置
    const settings = {
        searchEngine: currentEngine,
        bgType: currentBgType,
        bgColor: bgColorPicker.value,
        themeColor: currentThemeColor,
        displayMode: currentDisplayMode,
        overlayOpacity: overlayOpacity,
        quickLinksEnabled: quickLinksEnabled,
        quickLinks: quickLinks,
        showTitle: showTitle,
        customTitleText: customTitleText,
        showSearchHistoryEnabled: showSearchHistoryEnabled,
        engineSwitchEnabled: engineSwitchEnabled,
        bgInfoEnabled: bgInfoEnabled,
        directJumpEnabled: directJumpEnabled
    };

    // 转换为JSON字符串
    const jsonStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Starplex-Tab-Settings.json';
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);

    showToast('设置已导出');
}

// 导入设置
function importSettings(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const settings = JSON.parse(event.target.result);

            // 应用导入的设置
            if (settings.searchEngine) {
                setSearchEngine(settings.searchEngine);

                // 设置搜索引擎类型单选框选中
                searchEngineRadios.forEach(radio => {
                    radio.checked = radio.value === settings.searchEngine;
                });

                // 设置搜索引擎提示
                setSearchEngineName();
                updateEngineSwitcherUI();
            }

            if (settings.bgType) {
                currentBgType = settings.bgType;
                switchBgType(currentBgType);

                if (settings.bgColor) {
                    bgColorPicker.value = settings.bgColor;
                    if (currentBgType === 'color') {
                        handleColorChange();
                    }
                }

                // 设置背景类型单选框选中
                bgTypeRadios.forEach(radio => {
                    radio.checked = radio.value === currentBgType;
                });
            }

            if (settings.themeColor) {
                currentThemeColor = settings.themeColor;
                themeColorPicker.value = settings.themeColor;
                handleThemeColorChange({ target: { value: settings.themeColor } });
            }

            if (settings.displayMode) {
                currentDisplayMode = settings.displayMode;
                displayModeRadios.forEach(radio => {
                    radio.checked = radio.value === currentDisplayMode;
                });
                updateDisplayMode();
            }

            if (settings.overlayOpacity !== undefined) {
                overlayOpacity = settings.overlayOpacity;
                updateOverlayOpacity();
            }

            // 设置快速链接
            if (typeof settings.quickLinksEnabled !== 'undefined') {
                quickLinksEnabled = settings.quickLinksEnabled;
                quickLinksToggle.checked = quickLinksEnabled;
                updateQuickLinksToggleUI();
            }

            if (Array.isArray(settings.quickLinks)) {
                quickLinks = settings.quickLinks;
                updateQuickLinksEditor();
                updateQuickLinksDisplay(); // 导入设置后立即更新显示
            }

            // 应用标题设置
            if (settings.showTitle !== undefined) {
                showTitle = settings.showTitle;
                showTitleToggle.checked = showTitle;
                updateTitleDisplay();
            }

            if (settings.customTitleText) {
                customTitleText = settings.customTitleText;
                customTitleInput.value = customTitleText;
                updateTitleDisplay();
            }

            // 显示搜索历史设置
            if (settings.showSearchHistoryEnabled !== undefined) {
                showSearchHistoryEnabled = settings.showSearchHistoryEnabled;
                showSearchHistoryToggle.checked = showSearchHistoryEnabled;
                updateSearchHistoryDisplay();
            }

            if (settings.engineSwitchEnabled !== undefined) {
                engineSwitchEnabled = settings.engineSwitchEnabled;
                engineSwitchToggle.checked = engineSwitchEnabled;
                updateEngineSwitcherVisible();
            }

            if (settings.bgInfoEnabled !== undefined) {
                bgInfoEnabled = settings.bgInfoEnabled;
                bgInfoToggle.checked = bgInfoEnabled;
                updateBgInfoBtnVisible();
            }

            if (settings.directJumpEnabled !== undefined) {
                directJumpEnabled = settings.directJumpEnabled;
                directJumpToggle.checked = directJumpEnabled;
            }

            saveSettings();
            showToast('设置已导入');

            // 关键：清空备份并关闭面板，防止被预览机制还原
            settingsBackup = null;

            closeSettings();
        } catch (error) {
            console.error('导入设置失败:', error);
            showToast('导入失败，请检查文件格式');
        }
    };

    reader.readAsText(file);
}
/**
 * 抽卡生成故事游戏主程序
 */

// DOM元素
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const overlay = document.getElementById('overlay');
const apiKeyInput = document.getElementById('apiKey');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const startScreen = document.getElementById('startScreen');
const cardScreen = document.getElementById('cardScreen');
const storyScreen = document.getElementById('storyScreen');
const endScreen = document.getElementById('endScreen');

const startGameBtn = document.getElementById('startGameBtn');
const initialSettingInput = document.getElementById('initialSetting');
const currentRoundSpan = document.getElementById('currentRound');
const progressBar = document.getElementById('progressBar');

const card1 = document.getElementById('card1');
const card2 = document.getElementById('card2');
const card1Title = document.getElementById('card1Title');
const card1Desc = document.getElementById('card1Desc');
const card2Title = document.getElementById('card2Title');
const card2Desc = document.getElementById('card2Desc');

const loadingIndicator = document.getElementById('loadingIndicator');
const storyContent = document.getElementById('storyContent');
const nextRoundBtn = document.getElementById('nextRoundBtn');

const finalStory = document.getElementById('finalStory');
const saveStoryBtn = document.getElementById('saveStoryBtn');
const shareStoryBtn = document.getElementById('shareStoryBtn');
const newGameBtn = document.getElementById('newGameBtn');

// 游戏状态
let gameState = {
    currentRound: 0,
    maxRounds: 10,
    initialSetting: '',
    storyFragments: [],
    selectedCards: [],
    usedCards: new Set(), // 记录已使用的卡片
    apiKey: ''
};

// 初始化游戏
function initGame() {
    // 从本地存储加载API密钥
    gameState.apiKey = localStorage.getItem('volcApiKey') || '';
    apiKeyInput.value = gameState.apiKey;
    
    // 设置事件监听器
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    startGameBtn.addEventListener('click', startGame);
    card1.addEventListener('click', () => selectCard(0));
    card2.addEventListener('click', () => selectCard(1));
    nextRoundBtn.addEventListener('click', nextRound);
    
    saveStoryBtn.addEventListener('click', saveStory);
    shareStoryBtn.addEventListener('click', shareStory);
    newGameBtn.addEventListener('click', resetGame);
}

// 打开设置面板
function openSettings() {
    settingsPanel.style.display = 'block';
    overlay.style.display = 'block';
}

// 关闭设置面板
function closeSettings() {
    settingsPanel.style.display = 'none';
    overlay.style.display = 'none';
}

// 保存设置
function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        gameState.apiKey = apiKey;
        localStorage.setItem('volcApiKey', apiKey);
        alert('API密钥已保存');
    } else {
        alert('请输入有效的API密钥');
        return;
    }
    closeSettings();
}

// 开始游戏
function startGame() {
    // 检查API密钥
    if (!gameState.apiKey) {
        alert('请先在设置中配置API密钥');
        openSettings();
        return;
    }
    
    // 重置游戏状态
    gameState.currentRound = 1;
    gameState.storyFragments = [];
    gameState.selectedCards = [];
    gameState.usedCards.clear(); // 清空已使用卡片记录
    gameState.initialSetting = initialSettingInput.value.trim();
    
    // 更新UI
    currentRoundSpan.textContent = gameState.currentRound;
    updateProgressBar();
    
    // 显示卡片选择界面
    showScreen(cardScreen);
    
    // 生成两张随机卡片
    generateRandomCards();
}

// 生成随机卡片
function generateRandomCards() {
    // 过滤掉已使用的卡片
    const availableCards = cardsData.filter(card => !gameState.usedCards.has(card.title));
    
    // 随机打乱数组
    for (let i = availableCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableCards[i], availableCards[j]] = [availableCards[j], availableCards[i]];
    }
    
    // 选择前两张卡片
    const selectedCards = availableCards.slice(0, 2);
    
    // 更新UI
    card1Title.textContent = selectedCards[0].title;
    card1Desc.textContent = selectedCards[0].description;
    card2Title.textContent = selectedCards[1].title;
    card2Desc.textContent = selectedCards[1].description;
    
    // 存储当前展示的卡片并记录已使用
    gameState.currentCards = selectedCards;
    selectedCards.forEach(card => gameState.usedCards.add(card.title));
}

// 选择卡片
function selectCard(index) {
    // 存储选择的卡片
    const selectedCard = gameState.currentCards[index];
    gameState.selectedCards.push(selectedCard);
    
    // 显示故事生成界面
    showScreen(storyScreen);
    loadingIndicator.style.display = 'flex';
    storyContent.innerHTML = '';
    
    // 生成故事片段
    generateStoryFragment(selectedCard);
}

// 生成故事片段
async function generateStoryFragment(selectedCard) {
    try {
        // 构建提示信息
        let prompt = `我正在玩一个抽卡生成故事的游戏，现在是第${gameState.currentRound}轮，共10轮。我选择了「${selectedCard.title}」这张卡片，描述是：${selectedCard.description}\n`;
        
        // 添加初始设定（如果有）
        if (gameState.initialSetting && gameState.currentRound === 1) {
            prompt += `我的初始设定是：${gameState.initialSetting}\n`;
        }
        
        // 添加之前的故事片段（如果有）
        if (gameState.storyFragments.length > 0) {
            prompt += `之前的故事内容是：\n${gameState.storyFragments.join('\n')}\n`;
        }
        
        prompt += `请以第一人称的视角，生成一个连贯、有趣的故事片段（200-300字左右），这个片段应该与我之前的选择保持连贯性，并为后续的发展留下可能性。请直接给出故事内容，不要有任何前缀说明。`;
        
        // 调用API生成故事
        const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gameState.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-r1-250120',
                messages: [
                    {role: 'system', content: '你是一个创意故事生成器，根据用户的选择创作连贯有趣的第一视角故事片段。'},
                    {role: 'user', content: prompt}
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const storyFragment = data.choices[0].message.content.trim();
        
        // 存储故事片段
        gameState.storyFragments.push(storyFragment);
        
        // 更新UI
        storyContent.innerHTML = storyFragment;
        loadingIndicator.style.display = 'none';
        
    } catch (error) {
        console.error('生成故事时出错:', error);
        storyContent.innerHTML = `<p class="error-message">生成故事时出错: ${error.message}</p><p>请检查API密钥是否正确，或稍后再试。</p>`;
        loadingIndicator.style.display = 'none';
    }
}

// 进入下一轮
function nextRound() {
    gameState.currentRound++;
    
    // 检查是否达到最大回合数
    if (gameState.currentRound > gameState.maxRounds) {
        endGame();
        return;
    }
    
    // 更新UI
    currentRoundSpan.textContent = gameState.currentRound;
    updateProgressBar();
    
    // 显示卡片选择界面
    showScreen(cardScreen);
    
    // 生成新的随机卡片
    generateRandomCards();
}

// 结束游戏
function endGame() {
    // 显示结束界面
    showScreen(endScreen);
    
    // 显示完整故事
    finalStory.innerHTML = gameState.storyFragments.join('<hr>');
}

// 保存故事
function saveStory() {
    const storyText = gameState.storyFragments.join('\n\n----------\n\n');
    const blob = new Blob([storyText], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的故事.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 分享故事
function shareStory() {
    if (navigator.share) {
        navigator.share({
            title: '我的抽卡生成故事',
            text: gameState.storyFragments.join('\n\n----------\n\n')
        }).catch(error => {
            console.error('分享失败:', error);
            alert('分享失败，请手动复制分享。');
        });
    } else {
        // 如果不支持Web Share API，则复制到剪贴板
        const textarea = document.createElement('textarea');
        textarea.value = gameState.storyFragments.join('\n\n----------\n\n');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('故事已复制到剪贴板，您可以粘贴分享给他人。');
    }
}

// 重置游戏
function resetGame() {
    // 重置游戏状态
    gameState.currentRound = 0;
    gameState.storyFragments = [];
    gameState.selectedCards = [];
    initialSettingInput.value = '';
    
    // 更新UI
    currentRoundSpan.textContent = gameState.currentRound;
    updateProgressBar();
    
    // 显示开始界面
    showScreen(startScreen);
}

// 更新进度条
function updateProgressBar() {
    const progress = (gameState.currentRound / gameState.maxRounds) * 100;
    progressBar.style.width = `${progress}%`;
}

// 显示指定屏幕
function showScreen(screen) {
    // 隐藏所有屏幕
    startScreen.classList.remove('active');
    cardScreen.classList.remove('active');
    storyScreen.classList.remove('active');
    endScreen.classList.remove('active');
    
    // 显示指定屏幕
    screen.classList.add('active');
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
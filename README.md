# 抽卡生成故事网页小游戏

这是一个基于浏览器的互动故事生成游戏。玩家每次从两张卡片中进行选择，然后系统会根据选择以第一视角生成故事片段。游戏持续10轮，最终形成一个完整的个性化故事。

## 游戏特点

- 每轮提供两张随机卡片供玩家选择
- 基于玩家选择，使用AI生成第一视角故事片段
- 故事连贯性强，每个选择都会影响后续发展
- 游戏结束后可以查看完整故事
- 支持保存和分享故事

## 技术实现

- 前端：HTML, CSS, JavaScript
- AI生成：通过火山方舟的DeepSeek R1 API实现
- 响应式设计，适配各种设备

## 安装与使用

1. 克隆本仓库到本地
2. 打开`index.html`文件
3. 在设置中输入您的API密钥
4. 开始游戏并享受创作过程

## API配置

游戏使用火山方舟的DeepSeek R1 API来生成故事内容。首次使用时需要配置API密钥：

1. 点击游戏界面中的"设置"按钮
2. 在弹出的设置面板中输入您的API密钥
3. 点击保存，密钥将安全地存储在本地

## API调用说明

游戏使用以下方式调用DeepSeek R1 API：

```javascript
// API请求示例
fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-r1-250120',
    messages: [
      {role: 'system', content: '你是一个创意故事生成器，根据用户的选择创作连贯有趣的第一视角故事片段。'},
      {role: 'user', content: '基于用户选择的卡片内容生成故事...'}
    ]
  })
})
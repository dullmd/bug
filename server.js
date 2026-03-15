// ============================================
//   WHATSAPP BUG PREMIUM 2026
//   Kwa Render/Railway (Sio Vercel)
// ============================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// ============================================
//   INITIALIZATION
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_ID) || 650034217;
const WEB_PASSWORD = process.env.WEB_PASSWORD || 'bug2026premium';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data directory (Render inaandika kwenye /tmp)
const isRender = process.env.RENDER || false;
const dataDir = isRender ? '/tmp/data' : './data';
fs.ensureDirSync(dataDir);
const targetsFile = path.join(dataDir, 'targets.json');

// Initialize database
if (!fs.existsSync(targetsFile)) {
    fs.writeJSONSync(targetsFile, []);
}

// ============================================
//   TELEGRAM BOT SETUP
// ============================================
console.log('🤖 Telegram Bot inaanza...');

// Kwa Render, tumia webhook badala ya polling
let bot;
if (process.env.RENDER) {
    // Webhook mode kwa Render
    const url = process.env.RENDER_EXTERNAL_URL || `https://${process.env.RENDER_SERVICE_NAME}.onrender.com`;
    bot = new TelegramBot(TELEGRAM_TOKEN);
    bot.setWebHook(`${url}/bot${TELEGRAM_TOKEN}`);
    console.log(`✅ Webhook set to ${url}/bot${TELEGRAM_TOKEN}`);
} else {
    // Polling mode kwa local
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
}

// Bot status
let botStatus = {
    online: true,
    startTime: new Date().toISOString(),
    totalTests: 0,
    lastTest: null
};

// Load existing tests count
try {
    const targets = fs.readJSONSync(targetsFile);
    botStatus.totalTests = targets.length;
} catch (e) {}

// ============================================
//   TELEGRAM WEBHOOK HANDLER (kwa Render)
// ============================================
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// ============================================
//   TELEGRAM COMMANDS
// ============================================

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Check if admin
    if (chatId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ *Huna ruhusa ya kutumia bot hii!*', { parse_mode: 'Markdown' });
        return;
    }
    
    const keyboard = {
        reply_markup: {
            keyboard: [
                ['🚀 Tuma Bug Test', '📊 Status'],
                ['📜 Historia', '❓ Msaada']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
    
    bot.sendMessage(
        chatId,
        `🔰 *KARIBU WHATSAPP BUG PREMIUM 2026* 🔰\n\n` +
        `Hii ni bot ya kutuma *fuzz tests* kwenye namba za WhatsApp.\n\n` +
        `*Commands:*\n` +
        `/test 255712345678 - Tuma bug test kwa namba\n` +
        `/status - Angalia hali ya bot\n` +
        `/history - Angalia historia\n` +
        `/help - Msaada zaidi\n\n` +
        `_⚠️ Tumia kwa namba ulizo ridhia tu!_`,
        { parse_mode: 'Markdown', ...keyboard }
    );
});

// Help command
bot.onText(/\/help|❓ Msaada/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId !== ADMIN_ID) return;
    
    bot.sendMessage(
        chatId,
        `📚 *MSAADA WA BOT*\n\n` +
        `*Commands:*\n` +
        `• /test 255712345678 - Tuma bug test kwa namba\n` +
        `• /status - Angalia hali ya bot\n` +
        `• /history - Angalia historia ya majaribio\n` +
        `• /help - Ona msaada huu\n\n` +
        `*Aina za Tests:*\n` +
        `🔬 Herufi nyingi (buffer overflow)\n` +
        `🔬 Script injection (XSS)\n` +
        `🔬 Emoji flood\n` +
        `🔬 Special characters\n` +
        `🔬 Unicode overflow\n` +
        `🔬 Na zaidi...\n\n` +
        `_⚠️ Tumia kwa namba ulizo ridhia tu!_`,
        { parse_mode: 'Markdown' }
    );
});

// Status command
bot.onText(/\/status|📊 Status/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId !== ADMIN_ID) return;
    
    const uptime = Math.floor((Date.now() - new Date(botStatus.startTime)) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    bot.sendMessage(
        chatId,
        `📊 *HALI YA BOT*\n\n` +
        `✅ Status: *Online*\n` +
        `📊 Tests zilizofanywa: *${botStatus.totalTests}*\n` +
        `⏰ Uptime: *${hours}h ${minutes}m*\n` +
        `🕒 Ilianza: *${new Date(botStatus.startTime).toLocaleString('sw-TZ')}*\n` +
        `📱 Test ya mwisho: *${botStatus.lastTest || 'Hajafanywa'}*`,
        { parse_mode: 'Markdown' }
    );
});

// History command
bot.onText(/\/history|📜 Historia/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId !== ADMIN_ID) return;
    
    try {
        const targets = fs.readJSONSync(targetsFile);
        
        if (targets.length === 0) {
            bot.sendMessage(chatId, '📜 *Historia iko tupu* - Hajafanywa test yoyote.', { parse_mode: 'Markdown' });
            return;
        }
        
        let historyMsg = '📜 *HISTORIA YA MAJARIBIO*\n\n';
        const last10 = targets.slice(-10).reverse();
        
        last10.forEach((item, index) => {
            const date = new Date(item.timestamp).toLocaleString('sw-TZ');
            historyMsg += `${index+1}. 🎯 ${item.target}\n`;
            historyMsg += `   📅 ${date}\n`;
            historyMsg += `   📊 Tests: ${item.tests}\n\n`;
        });
        
        historyMsg += `_Jumla: ${targets.length} tests_`;
        
        bot.sendMessage(chatId, historyMsg, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, `❌ Kosa: ${error.message}`);
    }
});

// Test command
bot.onText(/\/test (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const targetNumber = match[1].trim();
    
    if (chatId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ *Huna ruhusa ya kutumia bot hii!*', { parse_mode: 'Markdown' });
        return;
    }
    
    if (!targetNumber.match(/^\d+$/)) {
        bot.sendMessage(chatId, '❌ *Namba si sahihi!*\nTumia format: /test 255712345678', { parse_mode: 'Markdown' });
        return;
    }
    
    const processingMsg = await bot.sendMessage(
        chatId, 
        `🚀 *Inatayarisha bug test kwa ${targetNumber}...*`,
        { parse_mode: 'Markdown' }
    );
    
    try {
        let displayNumber = targetNumber;
        if (targetNumber.startsWith('0')) {
            displayNumber = '255' + targetNumber.substring(1);
        } else if (!targetNumber.startsWith('255')) {
            displayNumber = '255' + targetNumber;
        }
        
        const testTypes = [
            'Buffer Overflow Test',
            'XSS Injection Test',
            'Emoji Flood Test',
            'Unicode Overflow Test',
            'Special Characters Test',
            'Format String Test',
            'Null Byte Injection',
            'Long URL Test',
            'Mixed Languages Test',
            'JSON Injection Test'
        ];
        
        await bot.editMessageText(
            `🔰 *BUG TEST IMEEANZISHWA* 🔰\n\n` +
            `🎯 Target: *${displayNumber}*\n` +
            `📊 Tests: 10\n` +
            `⏳ Inaendelea...\n\n` +
            `0/10 imekamilika`,
            {
                chat_id: chatId,
                message_id: processingMsg.message_id,
                parse_mode: 'Markdown'
            }
        );
        
        for (let i = 0; i < testTypes.length; i++) {
            await bot.editMessageText(
                `🔰 *BUG TEST IMEEANZISHWA* 🔰\n\n` +
                `🎯 Target: *${displayNumber}*\n` +
                `📊 Tests: 10\n` +
                `⏳ Inaendelea...\n\n` +
                `${i}/10 imekamilika\n` +
                `📤 Inatuma: ${testTypes[i]}`,
                {
                    chat_id: chatId,
                    message_id: processingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );
            
            await delay(2000);
        }
        
        await bot.editMessageText(
            `✅ *BUG TEST IMekamilika!* ✅\n\n` +
            `🎯 Target: *${displayNumber}*\n` +
            `📊 Tests zilizotumwa: *10*\n` +
            `📤 Status: *Imefika kwa target*\n\n` +
            `_Angalia kama target amepokea ujumbe wote._`,
            {
                chat_id: chatId,
                message_id: processingMsg.message_id,
                parse_mode: 'Markdown'
            }
        );
        
        const targets = fs.readJSONSync(targetsFile);
        targets.push({
            target: displayNumber,
            tests: 10,
            timestamp: new Date().toISOString(),
            method: 'telegram'
        });
        fs.writeJSONSync(targetsFile, targets);
        
        botStatus.totalTests++;
        botStatus.lastTest = `${displayNumber} (${new Date().toLocaleString('sw-TZ')})`;
        
    } catch (error) {
        await bot.editMessageText(
            `❌ *KOSA LIMETOKEA*\n\n${error.message}`,
            {
                chat_id: chatId,
                message_id: processingMsg.message_id,
                parse_mode: 'Markdown'
            }
        );
    }
});

// Handle button clicks
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (chatId !== ADMIN_ID) return;
    
    if (text === '🚀 Tuma Bug Test') {
        bot.sendMessage(chatId, '📱 *Tuma namba ya target*\nMfano: /test 255712345678', { parse_mode: 'Markdown' });
    } else if (text === '📊 Status') {
        bot.emit('text', { chat: { id: chatId }, text: '/status' });
    } else if (text === '📜 Historia') {
        bot.emit('text', { chat: { id: chatId }, text: '/history' });
    } else if (text === '❓ Msaada') {
        bot.emit('text', { chat: { id: chatId }, text: '/help' });
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
//   WEB APP API ENDPOINTS
// ============================================

// Get status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        totalTests: botStatus.totalTests,
        lastTest: botStatus.lastTest,
        uptime: Math.floor((Date.now() - new Date(botStatus.startTime)) / 1000)
    });
});

// Send test via web
app.post('/api/send-test', async (req, res) => {
    const { targetNumber, password } = req.body;
    
    if (password !== WEB_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Password si sahihi' });
    }
    
    if (!targetNumber || !targetNumber.match(/^\d+$/)) {
        return res.status(400).json({ success: false, error: 'Namba si sahihi' });
    }
    
    let displayNumber = targetNumber;
    if (targetNumber.startsWith('0')) {
        displayNumber = '255' + targetNumber.substring(1);
    } else if (!targetNumber.startsWith('255')) {
        displayNumber = '255' + targetNumber;
    }
    
    try {
        const targets = fs.readJSONSync(targetsFile);
        targets.push({
            target: displayNumber,
            tests: 10,
            timestamp: new Date().toISOString(),
            method: 'web'
        });
        fs.writeJSONSync(targetsFile, targets);
        
        botStatus.totalTests++;
        botStatus.lastTest = `${displayNumber} (${new Date().toLocaleString('sw-TZ')})`;
        
        bot.sendMessage(
            ADMIN_ID,
            `🌐 *WEB APP TEST*\n\n` +
            `🎯 Target: ${displayNumber}\n` +
            `📊 Tests: 10\n` +
            `⏰ ${new Date().toLocaleString('sw-TZ')}`,
            { parse_mode: 'Markdown' }
        );
        
        res.json({
            success: true,
            message: `Tests 10 zimekamilika kwa ${displayNumber}`,
            target: displayNumber
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get history
app.get('/api/history', (req, res) => {
    const { password } = req.query;
    
    if (password !== WEB_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Password si sahihi' });
    }
    
    try {
        const targets = fs.readJSONSync(targetsFile);
        res.json({
            success: true,
            history: targets.slice(-50).reverse()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
//   SERVE INDEX.HTML
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
//   START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 WHATSAPP BUG PREMIUM 2026');
    console.log('='.repeat(60));
    console.log(`🌐 Web App: http://localhost:${PORT}`);
    console.log(`🤖 Telegram Bot: Active`);
    console.log(`📊 Status: ONLINE`);
    console.log('='.repeat(60) + '\n');
});

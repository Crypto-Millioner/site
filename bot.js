// bot.js
const TelegramBot = require('node-telegram-bot-api');
const Database = require('better-sqlite3');
const path = require('path');

// Конфигурация
const CONFIG = {
  token: '7842285741:AAETC8ct5SuIL4F6WfIONoBjh8uVd4q0tdI',
  channelLink: 'https://t.me/+foGuLbHfSXZiMTli',
  cooldownDays: 3,
  maxAttempts: 3,
  questions: [
    {
      text: "Какой принцип важнее в блокчейне?",
      options: ["Централизация", "Прозрачность всех данных", "Децентрализация"],
      correct: 2,
      difficulty: 1
    },
    {
      text: "Что обеспечивает ZK-SNARK?",
      options: ["Скорость транзакций", "Конфиденциальность", "Увеличение блока"],
      correct: 1,
      difficulty: 2
    },
    {
      text: "Что такое B.L.A.D.E.?",
      options: ["Криптовалюта", "Анонимный браузер", "Blockchain Layered Anonymous Defense Engine"],
      correct: 2,
      difficulty: 1
    },
    {
      text: "Какой алгоритм использует Bitcoin?",
      options: ["SHA-256", "Scrypt", "Ethash"],
      correct: 0,
      difficulty: 2
    },
    {
      text: "Что такое миксер транзакций?",
      options: ["Биржа", "Сервис для анонимизации", "Кошелек"],
      correct: 1,
      difficulty: 3
    },
    {
      text: "Какой протокол использует Tor?",
      options: ["Onion routing", "VPN", "Proxy chains"],
      correct: 0,
      difficulty: 3
    },
    {
      text: "Что означает 'Layered' в B.L.A.D.E.?",
      options: ["Много пользователей", "Многоуровневая защита", "Разные блокчейны"],
      correct: 1,
      difficulty: 2
    },
    {
      text: "Какой язык чаще используют в смарт-контрактах?",
      options: ["Python", "Solidity", "Java"],
      correct: 1,
      difficulty: 2
    },
    {
      text: "Что такое 'gas' в Ethereum?",
      options: ["Комиссия", "Токен", "Протокол"],
      correct: 0,
      difficulty: 3
    },
    {
      text: "Какой проект разрабатывает B.L.A.D.E.?",
      options: ["PhantomSwap", "Uniswap", "PancakeSwap"],
      correct: 0,
      difficulty: 3
    }
  ],
  waitHours: 24
};

// Инициализация БД
const db = new Database('bot.db', {
  verbose: console.log,
  nativeBinding: path.join(__dirname, 'node_modules/better-sqlite3/build/Release/better_sqlite3.node')
});

// Оптимизация БД
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -16000'); // 16MB кэша

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    chat_id INTEGER UNIQUE,
    attempts INTEGER DEFAULT 0,
    last_attempt INTEGER,
    cooldown_until INTEGER,
    approved INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    question_id INTEGER,
    answer TEXT,
    is_correct INTEGER,
    timestamp INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_user_attempts ON users(chat_id, attempts);
  CREATE INDEX IF NOT EXISTS idx_user_answers ON user_answers(user_id, question_id);
`);

// Подготовленные запросы
const queries = {
  getUser: db.prepare('SELECT * FROM users WHERE chat_id = ?'),
  createUser: db.prepare('INSERT INTO users (chat_id, attempts, last_attempt) VALUES (?, ?, ?)'),
  updateUser: db.prepare('UPDATE users SET attempts = ?, last_attempt = ?, cooldown_until = ? WHERE chat_id = ?'),
  logAnswer: db.prepare('INSERT INTO user_answers (user_id, question_id, answer, is_correct, timestamp) VALUES (?, ?, ?, ?, ?)'),
  approveUser: db.prepare('UPDATE users SET approved = 1 WHERE chat_id = ?'),
  getStats: db.prepare('SELECT COUNT(*) as total, SUM(approved) as approved FROM users')
};

// Инициализация бота
const bot = new TelegramBot(CONFIG.token, {polling: true});

// Меню команд
bot.setMyCommands([
  {command: '/start', description: 'Начать тест'},
  {command: '/info', description: 'О проекте B.L.A.D.E.'},
  {command: '/stats', description: 'Статистика (только админ)'},
  {command: '/reset', description: 'Сбросить мои данные (только админ)'}
]);

// Информация о проекте
const BLADE_INFO = `
🔐 *B.L.A.D.E. - Blockchain Layered Anonymous Defense Engine*

*Наша миссия*:
Разработка инструментов для защиты приватности в блокчейн-пространстве.

*Основные проекты*:
- PhantomSwap: Децентрализованный миксер транзакций
- ShadowVault: Некастодиальный кошелек с усиленной защитой
- CryptoCloak EDU: Образовательная платформа

*Принципы*:
- Анонимность по умолчанию
- Многоуровневая защита
- Децентрализованная архитектура

После успешного прохождения теста вы получите доступ к приватному каналу с материалами и обсуждениями.
`;

// Обработчики команд
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await handleStart(chatId);
});

bot.onText(/\/info/, (msg) => {
  bot.sendMessage(msg.chat.id, BLADE_INFO, {parse_mode: 'Markdown'});
});

bot.onText(/\/stats/, (msg) => {
  if (msg.chat.id !== YOUR_ADMIN_CHAT_ID) return;
  const stats = queries.getStats.get();
  bot.sendMessage(msg.chat.id, `📊 Статистика:\nВсего пользователей: ${stats.total}\nОдобрено: ${stats.approved}`);
});

// Основная логика
async function handleStart(chatId) {
  const user = queries.getUser.get(chatId);
  const now = Math.floor(Date.now() / 1000);

  if (!user) {
    queries.createUser.run(chatId, 0, now);
    return showMainMenu(chatId);
  }

  if (user.approved) {
    bot.sendMessage(chatId, '✅ Вы уже прошли проверку. Ссылка на канал была отправлена ранее.');
    return;
  }

  if (user.cooldown_until && user.cooldown_until > now) {
    const remaining = formatTime(user.cooldown_until - now);
    bot.sendMessage(chatId, `⏳ Попробуйте снова через ${remaining}. Лимит попыток исчерпан.`);
    return;
  }

  if (user.attempts >= CONFIG.maxAttempts) {
    const cooldownUntil = now + (CONFIG.cooldownDays * 24 * 60 * 60);
    queries.updateUser.run(0, now, cooldownUntil, chatId);
    bot.sendMessage(chatId, `⏳ Превышен лимит попыток. Попробуйте снова через ${CONFIG.cooldownDays} дня.`);
    return;
  }

  await showMainMenu(chatId);
}

async function showMainMenu(chatId) {
  const options = {
    reply_markup: {
      keyboard: [
        ['🔍 О проекте B.L.A.D.E.'],
        ['📝 Пройти тест'],
        ['ℹ️ Помощь']
      ],
      resize_keyboard: true
    }
  };

  await bot.sendMessage(chatId, 'Добро пожаловать в B.L.A.D.E. Security Gate:', options);
}

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  if (msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.includes('О проекте')) {
    bot.sendMessage(chatId, BLADE_INFO, {parse_mode: 'Markdown'});
  } else if (text.includes('Помощь')) {
    bot.sendMessage(chatId, 'Просто начните тест и ответьте на вопросы. У вас есть 3 попытки.');
  } else if (text.includes('Пройти тест')) {
    await startQuiz(chatId);
  }
});

// Логика теста
async function startQuiz(chatId) {
  const user = queries.getUser.get(chatId);
  const now = Math.floor(Date.now() / 1000);
  
  queries.updateUser.run(user.attempts + 1, now, null, chatId);
  
  // Сортировка вопросов по сложности
  const sortedQuestions = [...CONFIG.questions].sort((a, b) => a.difficulty - b.difficulty);
  
  for (let i = 0; i < sortedQuestions.length; i++) {
    const question = sortedQuestions[i];
    const isCorrect = await askQuestion(chatId, question, i + 1);
    
    queries.logAnswer.run(
      user.id,
      i,
      question.options.indexOf(question.options.find(opt => opt === question.options[question.correct])),
      isCorrect ? 1 : 0,
      now
    );

    if (!isCorrect) {
      const remainingAttempts = CONFIG.maxAttempts - (user.attempts + 1);
      if (remainingAttempts > 0) {
        bot.sendMessage(chatId, `❌ Неверно! Осталось попыток: ${remainingAttempts}`);
      }
      return;
    }
  }

  // Все ответы верны
  queries.approveUser.run(chatId);
  setTimeout(() => {
    bot.sendMessage(chatId, `🎉 Поздравляем! Вот ваша ссылка: ${CONFIG.channelLink}`);
  }, CONFIG.waitHours * 60 * 60 * 1000);
  
  bot.sendMessage(chatId, `✅ Вы успешно прошли тест! Ссылка будет отправлена через ${CONFIG.waitHours} часов.`);
}

async function askQuestion(chatId, question, questionNum) {
  return new Promise((resolve) => {
    const options = {
      reply_markup: JSON.stringify({
        keyboard: question.options.map(opt => [opt]),
        one_time_keyboard: true
      })
    };

    bot.sendMessage(chatId, `Вопрос ${questionNum}/${CONFIG.questions.length}: ${question.text}`, options)
      .then(() => {
        bot.once('message', (msg) => {
          if (msg.chat.id !== chatId) return;
          const answer = msg.text.trim();
          const isCorrect = answer === question.options[question.correct];
          resolve(isCorrect);
        });
      });
  });
}

// Вспомогательные функции
function formatTime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const mins = Math.floor(seconds / 60);
  
  return `${days}д ${hours}ч ${mins}м`;
}

// Оптимизация БД по расписанию
setInterval(() => {
  db.exec('VACUUM; ANALYZE;');
}, 24 * 60 * 60 * 1000);

// Очистка при завершении
process.on('SIGINT', () => {
  db.close();
  process.exit();
});
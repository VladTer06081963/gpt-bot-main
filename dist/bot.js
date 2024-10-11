"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const grammy_1 = require("grammy");
const hydrate_1 = require("@grammyjs/hydrate");
const conversations_1 = require("@grammyjs/conversations"); //new
const types_1 = require("./src/types/types");
const typeguards_1 = require("./src/types/typeguards");
const User_1 = __importDefault(require("./db/User"));
const Chat_1 = __importDefault(require("./db/Chat"));
const Message_1 = __importDefault(require("./db/Message"));
const gpt_1 = require("./src/utils/gpt");
const consts_1 = require("./src/utils/consts");
const logger_1 = __importDefault(require("./logger"));
const commands_1 = require("./src/commands");
const imageConversation_1 = require("./src/conversations/imageConversation"); //new
if (!process.env.BOT_API_KEY) {
    throw new Error('BOT_API_KEY is not defined');
}
const bot = new grammy_1.Bot(process.env.BOT_API_KEY);
bot.use((0, grammy_1.session)({ initial: () => ({}) }));
bot.use((0, hydrate_1.hydrate)());
bot.use((0, conversations_1.conversations)()); //new
bot.use((0, conversations_1.createConversation)(imageConversation_1.imageConversation)); //new
bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Начать диалог',
    },
    {
        command: 'newchat',
        description: 'Начать новый чат',
    },
    {
        command: 'image',
        description: 'Сгенерировать изображение', //new
    },
    {
        command: 'models',
        description: 'Выбрать AI-модель',
    },
]);
// User commands
bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, first_name, username } = ctx.from;
    yield ctx.reply('Добро пожаловать!');
    try {
        let user = yield User_1.default.findOne({ telegramId: id });
        if (!user) {
            const responseMsg = yield ctx.reply('Создаю Ваш персональный чат-бот, одну секунду...');
            user = yield User_1.default.create({
                telegramId: id,
                firstName: first_name,
                userName: username,
            });
            yield responseMsg.editText('Ваш персональный чат-бот создан. Пожалуйста, введите ваш вопрос.\nВаш Telegram ID: ${id}');
        }
        else {
            yield ctx.reply('Пожалуйста, введите ваш вопрос');
        }
        const chat = yield Chat_1.default.create({
            userId: user._id,
        });
        ctx.session.chatId = chat._id.toString();
    }
    catch (error) {
        yield ctx.reply('Произошла ошибка при создании персонального чат-бота. Пожалуйста, попробуйте позже.');
        logger_1.default.error('Error in /start command:', error);
    }
}));
bot.command('newchat', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = ctx.from;
    try {
        const user = yield User_1.default.findOne({ telegramId: id });
        if (!user) {
            yield ctx.reply('Пожалуйста, начните с команды /start.');
            return;
        }
        const chat = yield Chat_1.default.create({
            userId: user._id,
        });
        ctx.session.chatId = chat._id.toString();
        yield ctx.reply('Новый чат создан. Пожалуйста, введите ваш вопрос.');
    }
    catch (error) {
        yield ctx.reply('Произошла ошибка при создании нового чата. Пожалуйста, попробуйте позже или обратитесь в поддержку');
        logger_1.default.error('Error in /newchat command:', error);
    }
}));
bot.command('image', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("imageConversation");
})); //new
bot.command('models', commands_1.changeModel);
// Admin commands
bot.command('stats', commands_1.getAnalytics);
// Callback queries
bot.callbackQuery(Object.keys(types_1.AiModelsLabels), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCallbackQuery();
    const selectedModel = ctx.callbackQuery.data;
    const { id } = ctx.from;
    if (!(0, typeguards_1.isValidAiModel)(selectedModel)) {
        yield ctx.callbackQuery.message.editText('Неверная модель. Пожалуйста, выберите правильную модель.');
        return;
    }
    try {
        const user = yield User_1.default.findOne({ telegramId: id });
        if (!user) {
            yield ctx.reply('Пожалуйста, начните с команды /start.');
            return;
        }
        user.selectedModel = selectedModel;
        yield user.save();
        yield ctx.callbackQuery.message.editText(`Вы переключились на модель ${types_1.AiModelsLabels[selectedModel]}  ✅`);
    }
    catch (error) {
        yield ctx.reply('Произошла ошибка при сохранении модели. Пожалуйста, попробуйте позже.');
        logger_1.default.error('Error in callbackQuery handler:', error);
    }
}));
// Message handler
bot.on('message:text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let chatId = ctx.session.chatId;
    let chatObj;
    const telegramId = ctx.from.id;
    const userMessageText = ctx.message.text;
    const responseMessage = yield ctx.reply('Загрузка...');
    try {
        const user = yield User_1.default.findOne({ telegramId });
        if (!user) {
            yield responseMessage.editText('Пользователь не найден. Пожалуйста, начните новый чат с помощью команды /start.');
            return;
        }
        if (!chatId) {
            const latestChat = yield Chat_1.default.findOne({ userId: user._id }).sort({ createdAt: -1 });
            if (latestChat) {
                chatObj = latestChat;
                chatId = latestChat._id.toString();
                ctx.session.chatId = chatId;
            }
            else {
                yield responseMessage.editText('Пожалуйста, начните новый чат с помощью команды /start.');
                return;
            }
        }
        const chat = chatObj || (yield Chat_1.default.findById(chatId));
        if (!chat) {
            yield ctx.reply('Чат не найден. Пожалуйста, начните новый чат с помощью команды /start.');
            return;
        }
        yield Message_1.default.create({
            chatId: chat._id,
            userId: user._id,
            role: 'user',
            content: userMessageText,
        });
        const messages = yield Message_1.default.find({ chatId: chat._id })
            .sort({ createdAt: 1 })
            .lean();
        const history = messages.slice(-consts_1.MAX_HISTORY_LENGTH);
        const selectedModelName = user.selectedModel;
        const answer = yield (0, gpt_1.answerWithChatGPT)(history, selectedModelName);
        if (!answer) {
            yield responseMessage.editText('Произошла ошибка при генерации ответа. Пожалуйста, попробуйте позже или обратитесь в поддержку.');
            return;
        }
        yield Message_1.default.create({
            chatId: chat._id,
            userId: user._id,
            role: 'assistant',
            content: answer,
        });
        chat.updatedAt = new Date();
        yield chat.save();
        yield responseMessage.editText(answer);
    }
    catch (error) {
        yield responseMessage.editText('Произошла ошибка при обработке запроса. Пожалуйста, обратитесь к администратору.');
        logger_1.default.error('Error in message handler:', error);
    }
}));
bot.catch((err) => {
    const ctx = err.ctx;
    logger_1.default.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        logger_1.default.error('Error in request:', e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        logger_1.default.error('Could not contact Telegram:', e);
    }
    else {
        logger_1.default.error('Unknown error:', e);
    }
});
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.MONGO_DB_URI) {
                throw new Error('MONGO_DB_URI is not defined');
            }
            yield mongoose_1.default.connect(process.env.MONGO_DB_URI);
            console.log('Connected to MongoDB');
            bot.start();
            console.log('Bot started');
        }
        catch (error) {
            const err = error;
            logger_1.default.error('Error connecting to MongoDB or starting bot:', err);
        }
    });
}
startBot();
// function isValidModel(selectedModel: string) {
//   throw new Error('Function not implemented.');
// }

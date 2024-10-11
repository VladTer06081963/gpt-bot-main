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
exports.getAnalytics = void 0;
const User_1 = __importDefault(require("../../db/User"));
const Chat_1 = __importDefault(require("../../db/Chat"));
const Message_1 = __importDefault(require("../../db/Message"));
const logger_1 = __importDefault(require("../../logger"));
const getAnalytics = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = 1045621572;
    if (!ctx.from || ctx.from.id !== adminId) {
        yield ctx.reply('Доступ ограничен');
        return;
    }
    try {
        const totalUsers = yield User_1.default.countDocuments();
        const users = yield User_1.default.find();
        let message = `📊 Статистика:\n\n`;
        message += `👥 Всего пользователей: ${totalUsers}\n\n`;
        for (const user of users) {
            const username = user.userName || user.firstName || 'Без имени';
            const chats = yield Chat_1.default.find({ userId: user._id });
            let messageCount = 0;
            for (const chat of chats) {
                const count = yield Message_1.default.countDocuments({ chatId: chat._id });
                messageCount += count;
            }
            message += `👤 : ${username}\n`;
            message += `✉️ : ${messageCount}\n\n`;
        }
        yield ctx.reply(message);
    }
    catch (error) {
        yield ctx.reply('Произошла ошибка при получении статистики.');
        logger_1.default.error('Error in /stats:', error);
    }
});
exports.getAnalytics = getAnalytics;

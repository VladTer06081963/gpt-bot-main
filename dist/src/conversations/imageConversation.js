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
exports.imageConversation = imageConversation;
const grammy_1 = require("grammy");
const gpt_1 = require("../utils/gpt");
const logger_1 = __importDefault(require("../../logger"));
const inlineKeyboard = new grammy_1.InlineKeyboard()
    .text("Отменить ❌", "cancelImageGeneration");
function imageConversation(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("Опишите, что должно быть на изображении (промпт для генерации):", {
            reply_markup: inlineKeyboard,
        });
        const conversationData = yield conversation.wait();
        const { message, callbackQuery } = conversationData;
        if ((callbackQuery === null || callbackQuery === void 0 ? void 0 : callbackQuery.data) === 'cancelImageGeneration') {
            yield conversationData.answerCallbackQuery();
            yield callbackQuery.message.editText("Генерация изображения отменена");
            return;
        }
        if (message === null || message === void 0 ? void 0 : message.text) {
            const responseMessage = yield ctx.reply('Генерация изображения...');
            try {
                const imageUrl = yield (0, gpt_1.generateImage)(message.text);
                if (!imageUrl) {
                    throw new Error('Image generation failed: no image URL');
                }
                yield responseMessage.editText('Готово!');
                yield ctx.replyWithPhoto(imageUrl);
            }
            catch (error) {
                yield ctx.reply('Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже или обратитесь в поддержку.');
                logger_1.default.error('Error in /image command:', error);
            }
            return;
        }
        return yield ctx.reply('Текст не получен, генерация отменена');
    });
}

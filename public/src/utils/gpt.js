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
exports.generateImage = exports.answerWithChatGPT = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const types_1 = require("../types/types");
const typeguards_1 = require("../types/typeguards");
const consts_1 = require("./consts");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const answerWithChatGPT = (messages_1, ...args_1) => __awaiter(void 0, [messages_1, ...args_1], void 0, function* (messages, modelName = consts_1.DEFAULT_AI_MODEL) {
    const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
    if (!(0, typeguards_1.isValidAiModel)(modelName)) {
        throw new Error('Invalid model name');
    }
    try {
        const response = yield openai.chat.completions.create({
            model: types_1.AiModels[modelName],
            messages: [
                { role: 'system', content: 'Ты полезный ассистент, отвечай кратко' },
                ...formattedMessages,
            ],
        });
        if (response.choices[0].message.content === null) {
            throw new Error('Content is null');
        }
        return response.choices[0].message.content;
        // return response.choices[0].message.content ?? '';
    }
    catch (error) {
        const err = error;
        throw err;
    }
});
exports.answerWithChatGPT = answerWithChatGPT;
const generateImage = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
    });
    return response.data[0].url;
});
exports.generateImage = generateImage;

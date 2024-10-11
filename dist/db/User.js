"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const consts_1 = require("../src/utils/consts");
const userSchema = new mongoose_1.default.Schema({
    telegramId: { type: Number, unique: true },
    firstName: String,
    userName: String,
    selectedModel: {
        type: String,
        default: consts_1.DEFAULT_AI_MODEL,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
});
exports.default = mongoose_1.default.model('User', userSchema);

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeModel = void 0;
const grammy_1 = require("grammy");
const types_1 = require("../types/types");
// import User from '../db/User';
const labelDataPairs = Object.entries(types_1.AiModelsLabels).map(([name, label]) => [label, name]);
const buttonRows = labelDataPairs
    .map(([label, data]) => [grammy_1.InlineKeyboard.text(label, data)]);
const keyboard = grammy_1.InlineKeyboard.from(buttonRows);
const changeModel = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Выберите модель:', {
        reply_markup: keyboard,
    });
});
exports.changeModel = changeModel;

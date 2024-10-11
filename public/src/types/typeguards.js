"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAiModel = void 0;
const types_1 = require("./types");
const isValidAiModel = (model) => {
    return typeof model === 'string' && model in types_1.AiModels;
};
exports.isValidAiModel = isValidAiModel;

import OpenAI from 'openai';
import 'dotenv/config';
import { IMessage } from '../../db/Message';
import { AiModels, ImageGenerationQuality } from '../types/types';
import { isValidAiModel } from '../types/typeguards';
import { DEFAULT_AI_MODEL } from './consts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const answerWithChatGPT = async (
  messages: IMessage[],
  telegramId: number,
  modelName: string = DEFAULT_AI_MODEL,
): Promise<string | null> => {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content,
  }));

  if (!isValidAiModel(modelName)) {
    throw new Error('Invalid model name');
  }

  try {
    const response = await openai.chat.completions.create({
      model: AiModels[modelName],
      messages: [
        { role: 'system', content: 'Ты полезный ассистент, отвечай кратко' },
        ...formattedMessages,
      ],
      user: telegramId.toString(),
    });

    return response.choices[0].message.content;
  } catch (error) {
    const err = error as Error;
    throw err;
  }
};


export const generateImage = async (prompt: string, quality: ImageGenerationQuality = ImageGenerationQuality.STANDARD): Promise<string | undefined> => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    quality: quality,
    prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
};

// import OpenAI from 'openai';
// import 'dotenv/config';
// import { IMessage } from '../../db/Message';
// import { AiModels } from '../types/types';
// import { isValidAiModel } from '../types/typeguards';
// import { DEFAULT_AI_MODEL } from './consts';

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export const answerWithChatGPT = async (
//   messages: IMessage[],
//   modelName: string = DEFAULT_AI_MODEL,
// ): Promise<string> => {
//   const formattedMessages = messages.map((msg) => ({
//     role: msg.role as 'system' | 'user' | 'assistant',
//     content: msg.content,
//   }));
  
//   if (!isValidAiModel(modelName)) {
//     throw new Error('Invalid model name');
//   }

//   try {
//     const response = await openai.chat.completions.create({
//       model: AiModels[modelName],
//       messages: [
//         { role: 'system', content: 'Ты полезный ассистент, отвечай кратко' },
//         ...formattedMessages,
//       ],
//     });
    
//     if (response.choices[0].message.content === null) {
//   throw new Error('Content is null');
// }
// return response.choices[0].message.content;
//     // return response.choices[0].message.content ?? '';
//   } catch (error) {
//     const err = error as Error;
//     throw err;
//   }
// };

// export const generateImage = async (prompt: string): Promise<string | undefined> => {
//   const response = await openai.images.generate({
//     model: "dall-e-3",
//     prompt,
//     n: 1,
//     size: "1024x1024",
//   });

//   return response.data[0].url;
// };

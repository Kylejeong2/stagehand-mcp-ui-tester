import OpenAI from 'openai';
import { stagehandInfo } from './prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface TestGenerationParams {
  componentCode: string;
  componentName: string;
  testInstructions?: string;
}

export async function generateStagehandTest(params: TestGenerationParams): Promise<string> {
  const systemPrompt = `You are an expert at writing UI tests using Stagehand, a tool that provides AI-powered browser automation.
Stagehand offers three main methods:
- act(): Perform actions like clicking, typing, etc.
- extract(): Get information from the page
- observe(): Analyze the page and suggest possible actions

Your task is to generate Stagehand test code that thoroughly tests React components.
Focus on:
1. Component rendering and visibility
2. Interactive elements and user actions
3. State changes and updates
4. Accessibility requirements
5. Error states and edge cases

Use natural language instructions with act() and extract() methods.
Example:
await stagehand.act('click the submit button');
const errorMessage = await stagehand.extract('get the error message text');`;

const userPrompt = `Given this React component:

${params.componentCode}

Generate Stagehand test code to verify:
1. Component renders correctly
2. All interactive elements work
3. Component behaves correctly under different states
4. Accessibility requirements are met

Here's how to use Stagehand:
${stagehandInfo}

Additional test requirements:
${params.testInstructions || 'None provided'}

Return ONLY the executable test code, no explanations.
Use Stagehand's act(), extract(), and observe() methods with natural language instructions.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });

  return response.choices[0].message.content || '';
} 
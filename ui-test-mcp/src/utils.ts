import OpenAI from 'openai';

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

export const stagehandInfo = `
# Stagehand Project

This is a project that uses Stagehand, which amplifies Playwright with \`act\`, \`extract\`, and \`observe\` added to the Page class.

\`Stagehand\` is a class that provides config, a \`StagehandPage\` object via \`stagehand.page\`, and a \`StagehandContext\` object via \`stagehand.context\`.

\`Page\` is a class that extends the Playwright \`Page\` class and adds \`act\`, \`extract\`, and \`observe\` methods.
\`Context\` is a class that extends the Playwright \`BrowserContext\` class.

Use the following rules to write code for this project.

- To plan an instruction like "click the sign in button", use Stagehand \`observe\` to get the action to execute.

\`\`\`typescript
const results = await page.observe("Click the sign in button");
\`\`\`

You can also pass in the following params:

\`\`\`typescript
await page.observe({
  instruction: the instruction to execute,
  onlyVisible: false, // DEFAULT: Returns better results and less tokens, but uses Chrome a11y tree so may not always target directly visible elements
  returnAction: true, // DEFAULT: return the action to execute
});
\`\`\`

- The result of \`observe\` is an array of \`ObserveResult\` objects that can directly be used as params for \`act\` like this:
  \`\`\`typescript
  const results = await page.observe({
    instruction: the instruction to execute,
    onlyVisible: false, // Returns better results and less tokens, but uses Chrome a11y tree so may not always target directly visible elements
    returnAction: true, // return the action to execute
  });
  await page.act(results[0]);
  \`\`\`
- When writing code that needs to extract data from the page, use Stagehand \`extract\`. Explicitly pass the following params by default:

\`\`\`typescript
const { someValue } = await page.extract({
  instruction: the instruction to execute,
  schema: z.object({
    someValue: z.string(),
  }), // The schema to extract
  useTextExtract: true, // Set true for better results on larger extractions (sentences, paragraphs, etc), or set false for small extractions (name, birthday, etc)
});
\`\`\`

## Initialize

\`\`\`typescript
import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config";

const stagehand = new Stagehand(StagehandConfig);
await stagehand.init();

const page = stagehand.page; // Playwright Page with act, extract, and observe methods
const context = stagehand.context; // Playwright BrowserContext
\`\`\`

## Act

You can cache the results of \`observe\` and use them as params for \`act\` like this:

\`\`\`typescript
const instruction = "Click the sign in button";
const cachedAction = await getCache(instruction);

if (cachedAction) {
  await page.act(cachedAction);
} else {
  try {
    const results = await page.observe(instruction);
    await setCache(instruction, results);
    await page.act(results[0]);
  } catch (error) {
    await page.act(instruction); // If the action is not cached, execute the instruction directly
  }
}
\`\`\`

Be sure to cache the results of \`observe\` and use them as params for \`act\` to avoid unexpected DOM changes. Using \`act\` without caching will result in more unpredictable behavior.

Act \`action\` should be as atomic and specific as possible, i.e. "Click the sign in button" or "Type 'hello' into the search input".
AVOID actions that are more than one step, i.e. "Order me pizza" or "Send an email to Paul asking him to call me".

## Extract

If you are writing code that needs to extract data from the page, use Stagehand \`extract\`.

\`\`\`typescript
const signInButtonText = await page.extract("extract the sign in button text");
\`\`\`

You can also pass in params like an output schema in Zod, and a flag to use text extraction:

\`\`\`typescript
const data = await page.extract({
  instruction: "extract the sign in button text",
  schema: z.object({
    text: z.string(),
  }),
  useTextExtract: true, // Set true for larger-scale extractions (multiple paragraphs), or set false for small extractions (name, birthday, etc)
});
\`\`\`

\`schema\` is a Zod schema that describes the data you want to extract. To extract an array, make sure to pass in a single object that contains the array, as follows:

\`\`\`typescript
const data = await page.extract({
  instruction: "extract the text inside all buttons",
  schema: z.object({
    text: z.array(z.string()),
  }),
  useTextExtract: true, // Set true for larger-scale extractions (multiple paragraphs), or set false for small extractions (name, birthday, etc)
});
\`\`\`
`;
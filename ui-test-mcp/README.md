# UI Test MCP Tool
[![smithery badge](https://smithery.ai/badge/@Kylejeong2/stagehand-mcp-ui-tester)](https://smithery.ai/server/@Kylejeong2/stagehand-mcp-ui-tester)

An MCP-compatible command-line tool for testing React/Next.js UI components using AI-powered Stagehand tests.

## Features

- AI-powered test generation using GPT-4
- Stagehand browser automation
- Natural language test instructions
- Screenshot capture and verification
- Accessibility testing
- State management testing
- Cross-browser testing support

## Installation

### Installing via Smithery

To install UI Test MCP for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@Kylejeong2/stagehand-mcp-ui-tester):

```bash
npx -y @smithery/cli install @Kylejeong2/stagehand-mcp-ui-tester --client claude
```

### Manual Installation
```bash
npm install
npm run build
npm link  # Makes the command globally available
```

## Environment Setup

1. Get an OpenAI API key from https://platform.openai.com
2. Set the environment variable:
```bash
export OPENAI_API_KEY=your_api_key_here
```

## Integration with Cursor

Add this tool in your Cursor settings:

1. Open Cursor Settings
2. Go to Features > MCP
3. Click "+ Add New MCP Server"
4. Fill in the form:
   - Name: UI Test MCP
   - Type: stdio
   - Command: ui-test-mcp

## How It Works

1. You provide:
   - Component source code
   - Component name
   - Test URL
   - Additional test instructions (optional)

2. The tool:
   - Analyzes your component using GPT-4
   - Generates Stagehand test code
   - Executes tests in a real browser
   - Captures screenshots
   - Returns results and test code

## Example Usage

```typescript
const request = {
  id: "1",
  method: "test_component",
  params: {
    componentCode: `
      // Your React component code here
    `,
    componentName: "Button",
    testUrl: "http://localhost:3000/test/button",
    testInstructions: `
      Additional test cases:
      1. Verify hover state
      2. Check accessibility
      3. Test error states
    `
  }
};

// Send to MCP tool
const response = await fetch('http://localhost:8000/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const result = await response.json();
console.log('Generated Test:', result.result.testCode);
```

## Test Generation

The AI generates tests that cover:

1. **Component Rendering**
   - Initial state verification
   - Prop validation
   - Style and layout checks

2. **Interaction Testing**
   - Click events
   - Hover states
   - Form inputs
   - Keyboard navigation

3. **State Management**
   - State updates
   - Side effects
   - Event handlers
   - Async operations

4. **Accessibility**
   - ARIA attributes
   - Keyboard support
   - Screen reader compatibility
   - Color contrast

5. **Error Handling**
   - Invalid props
   - Network errors
   - Edge cases
   - Error boundaries

## Example Test Output

The AI generates Stagehand test code like:

```typescript
// Check initial rendering
await stagehand.act('wait for the Button component to be visible');
const isVisible = await stagehand.extract('check if the button is visible');
console.log('Button visibility:', isVisible);

// Test hover state
await stagehand.act('hover over the button');
const hoverState = await stagehand.extract('get the button background color');
console.log('Hover state color:', hoverState);

// Test click behavior
await stagehand.act('click the button');
const clickResult = await stagehand.extract('check if the onClick handler was called');
console.log('Click result:', clickResult);

// Check accessibility
const a11y = await stagehand.extract('get all ARIA attributes of the button');
console.log('Accessibility attributes:', a11y);
```

## Development

1. Build the tool:
```bash
npm run build
```

2. Run in development mode:
```bash
npm run dev
```

3. Test the tool:
```bash
echo '{"id":"1","method":"test_component","params":{"componentCode":"...","componentName":"Button","testUrl":"http://localhost:3000/test"}}' | ui-test-mcp
```

## Debugging

- Set `DEBUG=1` for verbose logging
- Tests run in headed mode by default
- Screenshots are saved in the current directory
- Test code is logged to console

## Error Handling

The tool handles common errors:
- Invalid component code
- Unreachable test URL
- LLM API errors
- Browser automation failures

Each error includes:
- Error code
- Detailed message
- Stack trace (in debug mode)
- Screenshot of failure state

#!/usr/bin/env bun

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { Stagehand } from '@browserbasehq/stagehand';
import { generateStagehandTest } from './llm';

const TEST_COMPONENT_TOOL: Tool = {
  name: "test_component",
  description: "Test a React/Next.js UI component using AI-generated Stagehand tests",
  inputSchema: {
    type: "object",
    properties: {
      componentCode: {
        type: "string",
        description: "The source code of the component to test"
      },
      componentName: {
        type: "string",
        description: "The name of the component"
      },
      testUrl: {
        type: "string",
        description: "URL where the component is rendered"
      },
      testInstructions: {
        type: "string",
        description: "Additional testing instructions or requirements"
      }
    },
    required: ["componentCode", "componentName", "testUrl"]
  }
};

class UITestMCP {
  private stagehand: Stagehand | null = null;

  async init() {
    if (!this.stagehand) {
      this.stagehand = new Stagehand({
        env: "LOCAL",
        verbose: 1,
      });
      await this.stagehand.init();
    }
  }

  async cleanup() {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }

  async handleTestComponent(args: any) {
    const { componentCode, componentName, testUrl, testInstructions } = args;
    
    await this.init();
    await this.stagehand!.page.goto(testUrl);
    
    const testCode = await generateStagehandTest({
      componentCode,
      componentName,
      testInstructions
    });

    const result = await eval(`(async () => {
      const stagehand = this.stagehand;
      ${testCode}
      return { success: true };
    })()`);

    const screenshot = await this.stagehand!.page.screenshot();

    return {
      content: [
        { type: "text", text: testCode },
        { 
          type: "image", 
          data: screenshot.toString('base64'),
          mimeType: "image/png"
        }
      ],
      isError: false
    };
  }
}

const mcp = new UITestMCP();
const server = new Server(
  {
    name: "UI Test MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "test_component": {
        return await mcp.handleTestComponent(args);
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: error.message }],
      isError: true
    };
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [TEST_COMPONENT_TOOL],
}));

// Cleanup on exit
process.on('SIGINT', async () => {
  await mcp.cleanup();
  process.exit(0);
});


const transport = new StdioServerTransport();
server.connect(transport);
console.error("UI Test MCP Server running on stdio");
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { Stagehand } from '@browserbasehq/stagehand';
import { generateStagehandTest } from './utils.js';

// Define the tools
const TOOLS: Tool[] = [
  {
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
  }
];

// Global state
let stagehand: Stagehand | undefined;
const consoleLogs: string[] = [];
const operationLogs: string[] = [];

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  operationLogs.push(logMessage);
  if (process.env.DEBUG) console.error(logMessage);
}

// Ensure Stagehand is initialized
async function ensureStagehand() {
  log("Ensuring Stagehand is initialized...");
  if (!stagehand) {
    log("Initializing Stagehand...");
    stagehand = new Stagehand({
      env: "LOCAL",
      headless: true,
      verbose: 2,
      debugDom: true,
      modelName: "claude-3-5-sonnet-20241022",
    });
    log("Running init()");
    await stagehand.init();
    log("Stagehand initialized successfully");
  }
  return stagehand;
}

// Handle tool calls
async function handleToolCall(name: string, args: any): Promise<CallToolResult> {
  log(`Handling tool call: ${name} with args: ${JSON.stringify(args)}`);

  try {
    stagehand = await ensureStagehand();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`Failed to initialize Stagehand: ${errorMsg}`);
    return {
      content: [
        { type: "text", text: `Failed to initialize Stagehand: ${errorMsg}` },
        { type: "text", text: `Operation logs:\n${operationLogs.join("\n")}` }
      ],
      isError: true
    };
  }

  switch (name) {
    case "test_component": {
      try {
        const { componentCode, componentName, testUrl, testInstructions } = args;
        
        log(`Testing component ${componentName} at ${testUrl}`);
        await stagehand.page.goto(testUrl);
        
        log("Generating test code...");
        const testCode = await generateStagehandTest({
          componentCode,
          componentName,
          testInstructions
        });
        log("Test code generated successfully");

        log("Executing test code...");
        const result = await eval(`(async () => {
          const stagehand = this.stagehand;
          ${testCode}
          return { success: true };
        })()`);
        log("Test code executed successfully");

        log("Taking screenshot...");
        const screenshot = await stagehand.page.screenshot();
        log("Screenshot captured");

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
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log(`Test execution failed: ${errorMsg}`);
        return {
          content: [
            { type: "text", text: `Failed to test component: ${errorMsg}` },
            { type: "text", text: `Operation logs:\n${operationLogs.join("\n")}` }
          ],
          isError: true
        };
      }
    }
    default:
      log(`Unknown tool called: ${name}`);
      return {
        content: [
          { type: "text", text: `Unknown tool: ${name}` },
          { type: "text", text: `Operation logs:\n${operationLogs.join("\n")}` }
        ],
        isError: true
      };
  }
}

// Create the server
const server = new Server(
  {
    name: "UI Test MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Setup request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log("Listing available tools");
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  log(`Received tool call request for: ${request.params.name}`);
  operationLogs.length = 0; // Clear logs for new operation
  const result = await handleToolCall(
    request.params.name,
    request.params.arguments ?? {}
  );
  log("Tool call completed");
  return result;
});

// Run the server
async function runServer() {
  log("Starting UI Test MCP server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Server started successfully");
}

runServer().catch((error) => {
  log(`Server error: ${error instanceof Error ? error.message : String(error)}`);
  console.error(error);
});
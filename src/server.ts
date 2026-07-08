import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMatrixTools } from "./register-tools.js";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "matrix-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        logging: {},
        resources: {},
        tools: {},
      },
    }
  );

  registerMatrixTools(server, {
    enableActionTools: process.env.MATRIX_MCP_ENABLE_ACTION_TOOLS === "true",
  });

  return server;
}

const server = createMcpServer();

export default server;

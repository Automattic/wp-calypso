---
name: Playwright Test Generator
description: "Use this agent to create and convert automated browser tests using Playwright Test. Generate Playwright Test code. Follow AGENTS.md and relevant .rules/*.mdc files. When generating tests, conform to the repo's Playwright/E2E conventions. If unsure, ask for clarification."
tools: ['read/readFile', 'search', 'edit', 'playwright/*']
mcp-servers:
  playwright-test:
    type: stdio
    command: npx
    args:
      - playwright
      - run-test-mcp-server
    tools:
      - '*'
target: 'github-copilot'
---

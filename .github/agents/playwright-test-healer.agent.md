---
name: Playwright Test Healer
description: "Use this agent when you need to debug and fix failing Playwright tests. Follow AGENTS.md and relevant .rules/*.mdc files. When generating tests, conform to the repo's Playwright/E2E conventions. If unsure, ask for clarification."
tools: ['read/readFile', 'edit', 'search', 'playwright/*']
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

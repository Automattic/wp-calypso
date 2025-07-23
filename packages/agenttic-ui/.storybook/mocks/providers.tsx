import React from 'react';
import { AgentChatProvider } from '../../src/context/AgentChatContext';
import type { ContextProvider, ToolProvider } from '../../src/types';

interface MockProvidersProps {
  children: React.ReactNode;
  agentId?: string;
  agentUrl?: string;
  sessionId?: string;
  scenario?: 'default' | 'error' | 'slow' | 'empty';
}

export const MockProviders: React.FC<MockProvidersProps> = ({
  children,
  agentId = 'mock-agent',
  agentUrl = 'https://api.example.com/agent',
  sessionId,
  scenario = 'default'
}) => {
  const mockContextProvider: ContextProvider = {
    getClientContext: () => ({
      selectedBlockClientId: 'mock-block-id',
      currentPage: {
        title: 'Test Page',
        url: 'https://example.com/test',
      },
      user: {
        name: 'Test User',
        role: 'admin',
      },
    }),
  };

  const mockToolProvider: ToolProvider = {
    getAvailableTools: async () => [
      {
        id: 'mock_tool',
        name: 'Mock Tool',
        description: 'A mock tool for testing',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Test query' },
          },
        },
      },
    ],
    executeTool: async (toolId: string, args: any) => ({
      result: `Mock result for ${toolId} with args: ${JSON.stringify(args)}`,
      returnToAgent: true,
    }),
  };

  return (
    <AgentChatProvider
      agentId={agentId}
      agentUrl={agentUrl}
      sessionId={sessionId || `mock-session-${Date.now()}`}
      contextProvider={mockContextProvider}
      toolProvider={mockToolProvider}
    >
      {children}
    </AgentChatProvider>
  );
};

import type { Message, Suggestion } from '../../src/types';

export const createMockMessage = (
  role: 'user' | 'assistant' | 'error',
  content: string,
  options: Partial<Message> = {}
): Message => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content: [
    {
      type: 'text',
      text: content,
    },
  ],
  created_at: Date.now(),
  archived: false,
  showIcon: true,
  ...options,
});

export const createMockComponentMessage = (
  component: React.ComponentType,
  props: any = {},
  options: Partial<Message> = {}
): Message => ({
  id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'assistant',
  content: [
    {
      type: 'component',
      component,
      componentProps: props,
    },
  ],
  created_at: Date.now(),
  archived: false,
  showIcon: true,
  ...options,
});

export const mockMessages: Message[] = [
  createMockMessage('user', 'Hello! Can you help me with my WordPress site?'),
  createMockMessage('assistant', 'Hello! I\'d be happy to help you with your WordPress site. I can assist with content creation, site optimization, SEO improvements, and much more. What would you like to work on?'),
  createMockMessage('user', 'Show me my site analytics'),
  createMockMessage('assistant', 'I\'ll fetch your site analytics for you. Let me analyze your traffic and engagement data...', {
    created_at: Date.now() - 60000, // 1 minute ago
  }),
  createMockMessage('user', 'Can you also help me optimize my content?'),
  createMockMessage('assistant', 'Absolutely! Here are your analytics insights and content optimization recommendations. Your site is performing well with good engagement across multiple pages.'),
];

export const mockThinkingMessage: Message = createMockMessage(
  'assistant',
  'Let me analyze your site data...',
  {
    id: 'thinking-message',
    showIcon: false,
  }
);

export const mockErrorMessage: Message = createMockMessage(
  'error',
  'Sorry, I encountered an error while processing your request. Please try again.',
  {
    id: 'error-message',
  }
);

export const mockSuggestions: Suggestion[] = [
  {
    id: 'suggest-1',
    label: 'Site analytics',
    prompt: 'Show me my site analytics for the last 30 days',
  },
  {
    id: 'suggest-2',
    label: 'Content insights',
    prompt: 'What are my top performing pages?',
  },
  {
    id: 'suggest-3',
    label: 'SEO improvements',
    prompt: 'Help me improve my SEO',
  },
  {
    id: 'suggest-4',
    label: 'Site performance',
    prompt: 'How is my site performing this month?',
  },
];

export const getSuggestionsForContext = (context: string): Suggestion[] => {
  const suggestionSets = {
    button: [
      { id: 'btn-1', label: 'Style this button', prompt: 'Can you help me style this button?' },
      { id: 'btn-2', label: 'Add click tracking', prompt: 'Add click tracking to this button' },
    ],
    heading: [
      { id: 'head-1', label: 'Improve SEO', prompt: 'How can I improve SEO for this heading?' },
      { id: 'head-2', label: 'Make it stand out', prompt: 'Make this heading more prominent' },
    ],
    image: [
      { id: 'img-1', label: 'Optimize image', prompt: 'How can I optimize this image?' },
      { id: 'img-2', label: 'Add alt text', prompt: 'Help me write better alt text for this image' },
    ],
    pattern: [
      { id: 'pat-1', label: 'Customize pattern', prompt: 'How can I customize this pattern?' },
      { id: 'pat-2', label: 'Similar patterns', prompt: 'Show me similar patterns' },
    ],
  };

  const defaultSuggestions = [
    { id: 'default-1', label: 'Site analytics', prompt: 'Show me my site analytics' },
    { id: 'default-2', label: 'Content help', prompt: 'Help me improve my content' },
  ];

  return suggestionSets[context as keyof typeof suggestionSets] || defaultSuggestions;
};

export const createMockToolResponse = (
  type: 'component' | 'text' | 'markdown',
  content?: string,
  component?: string,
  props?: Record<string, any>
): any => ({
  type,
  content,
  component,
  props,
});

export const mockSiteData = [
  { page: 'Homepage', views: 1450 },
  { page: 'About Us', views: 892 },
  { page: 'Blog Posts', views: 2340 },
  { page: 'Contact', views: 673 },
  { page: 'Services', views: 1234 },
];

export const createErrorAgent = (errorType: 'network' | 'auth' | 'timeout') => {
  const errorMessages = {
    network: 'Network connection failed. Please check your internet connection.',
    auth: 'Authentication failed. Please log in again.',
    timeout: 'Request timed out. The server took too long to respond.',
  };

  return {
    sendMessage: async () => {
      throw new Error(`Mock ${errorType} error: ${errorMessages[errorType]}`);
    },
    getContext: async () => {
      throw new Error(`Mock ${errorType} error: ${errorMessages[errorType]}`);
    },
  };
};

export const mockConversationStates = {
  empty: {
    messages: [],
    isThinking: false,
    suggestions: mockSuggestions,
  },
  withMessages: {
    messages: mockMessages,
    isThinking: false,
    suggestions: [],
  },
  thinking: {
    messages: [...mockMessages, mockThinkingMessage],
    isThinking: true,
    suggestions: [],
  },
  error: {
    messages: [...mockMessages, mockErrorMessage],
    isThinking: false,
    error: 'Failed to connect to agent',
    suggestions: mockSuggestions,
  },
  withSuggestions: {
    messages: mockMessages.slice(0, 2),
    isThinking: false,
    suggestions: mockSuggestions,
  },
};

export const mockBlockEditorContext = {
  selectedBlockClientId: 'qwu2',
  selectedBlocks: [{
    clientId: 'qwu2',
    name: 'core/paragraph',
    attributes: {
      content: "Discover why Mama's Bread is celebrated for its fresh, artisanal bread crafted with passion and tradition.",
    },
  }],
  currentPage: {
    title: "Mama's Bread Bakery",
    url: 'https://example.com/mamas-bread',
  },
};

export const createUserMessage = (content: string): Message =>
  createMockMessage('user', content);

export const createAssistantMessage = (content: string): Message =>
  createMockMessage('assistant', content);

export const createErrorMessage = (content: string): Message =>
  createMockMessage('error', content);

// Generate a conversation with N messages
export const generateConversation = (messageCount: number): Message[] => {
  const conversation: Message[] = [];

  for (let i = 0; i < messageCount; i++) {
    const isUser = i % 2 === 0;
    const content = isUser
      ? `User message ${Math.floor(i / 2) + 1}: This is a sample question or request.`
      : `Assistant response ${Math.floor(i / 2) + 1}: This is a helpful response to the user's question.`;

    conversation.push(createMockMessage(
      isUser ? 'user' : 'assistant',
      content,
      { created_at: Date.now() - (messageCount - i) * 30000 } // Spread over time
    ));
  }

  return conversation;
};

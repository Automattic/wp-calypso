// Mock WordPress data store for Storybook
export const createMockAgent = () => {
  const responses = [
    "I'm here to help you with your WooCommerce store! I can assist with analytics, product management, orders, customer data, and much more.",
    "Let me analyze your store data to provide you with insights and recommendations.",
    "Based on your store's performance, I can suggest ways to optimize your sales and improve customer experience.",
    "I'll help you understand your store metrics and identify opportunities for growth.",
    "Great question! I can provide detailed analytics and actionable insights for your business.",
  ];

  return {
    sendMessage: async (message: string) => {
      // Select a response based on message content or randomly
      const response = message.toLowerCase().includes('hello') || message.toLowerCase().includes('help')
        ? responses[0]
        : responses[Math.floor(Math.random() * responses.length)];

      async function* streamResponse() {
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          yield {
            content: words[i] + (i < words.length - 1 ? ' ' : ''),
            type: 'text'
          };

          const delay = Math.random() * 80 + 40; // 40-120ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return streamResponse();
    },
    getContext: async () => ({
      user: {
        name: 'Test User',
        role: 'admin',
        email: 'test@example.com',
        capabilities: ['manage_woocommerce', 'manage_options']
      },
      site: {
        title: 'Test WooCommerce Store',
        url: 'https://test-store.example.com',
        timezone: 'America/New_York',
        currency: 'USD'
      },
      store: {
        totalProducts: 45,
        totalOrders: 127,
        totalCustomers: 89,
        monthlyRevenue: 12450.75
      }
    }),
  };
};


let mockMessages: any[] = [];
let mockIsThinking = false;
let mockIsSendingMessage = false;
let mockError: string | null = null;

// Initialize mock WordPress data stores if needed
if (typeof window !== 'undefined' && !(window as any).wp) {
  (window as any).wp = {
    data: {
      select: () => (store: string) => {
        // Mock different store responses
        if (store === 'a8c-agenttic-ui') {
          return {
            getMessages: () => mockMessages,
            getIsThinking: () => mockIsThinking,
            getIsSendingMessage: () => mockIsSendingMessage,
            getIsTyping: () => false,
            getError: () => mockError,
            getAssistant: () => null,
            getPendingToolCallbacks: () => [],
            getCurrentToolCall: () => null,
          };
        }
        if (store === 'core/editor') {
          return {
            getCurrentPostId: () => 123,
            getCurrentPostType: () => 'page',
            getEditedPostTitle: () => 'Test Page',
          };
        }
        if (store === 'core/block-editor') {
          return {
            getSelectedBlockClientIds: () => ['mock-block-id'],
            getBlocks: () => [],
            getSelectedBlock: () => null,
          };
        }
        if (store === 'core') {
          return {
            getCurrentUser: () => ({
              id: 1,
              name: 'Test User',
              roles: ['administrator'],
            }),
          };
        }
        return {};
      },
      dispatch: () => (store: string) => {
        if (store === 'a8c-agenttic-ui') {
          return {
            runAgent: async (message: string) => {
              mockIsSendingMessage = true;
              mockMessages = [...mockMessages, {
                id: Date.now().toString(),
                content: message,
                role: 'user'
              }];

              // Simulate assistant response
              setTimeout(() => {
                mockIsThinking = true;
                mockIsSendingMessage = false;
              }, 500);

              setTimeout(() => {
                mockMessages = [...mockMessages, {
                  id: (Date.now() + 1).toString(),
                  content: `I understand you said: "${message}". This is a mock response.`,
                  role: 'assistant'
                }];
                mockIsThinking = false;
              }, 2000);
            },
            addUserMessage: (message: any) => {
              mockMessages = [...mockMessages, message];
            },
            assistantSay: (content: string) => {
              mockMessages = [...mockMessages, {
                id: Date.now().toString(),
                content,
                role: 'assistant'
              }];
            },
            addMessage: (message: any) => {
              mockMessages = [...mockMessages, message];
            },
            deleteMessage: (id: string) => {
              mockMessages = mockMessages.filter(m => m.id !== id);
            },
            clearMessages: () => {
              mockMessages = [];
            },
            setThinking: (thinking: boolean) => {
              mockIsThinking = thinking;
            },
            setError: (error: string | null) => {
              mockError = error;
            },
            clearAgents: () => {},
            removeAgent: () => {},
            resetConversation: () => {
              mockMessages = [];
              mockError = null;
              mockIsThinking = false;
              mockIsSendingMessage = false;
            },
          };
        }
        // Default dispatch functions
        return {
          createNotice: () => {},
          removeNotice: () => {},
        };
      },
      subscribe: () => () => {},
      use: () => {},
      combineReducers: () => {},
      registerStore: () => {},
    },
    element: {
      createElement: (window as any).React?.createElement,
      Fragment: (window as any).React?.Fragment,
    },
    hooks: {
      addFilter: () => {},
      addAction: () => {},
      applyFilters: (filter: string, value: any) => value,
      doAction: () => {},
    },
  };
}

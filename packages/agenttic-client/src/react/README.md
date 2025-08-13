# React Consumer with Conversation Persistence

The React consumer now supports automatic conversation persistence across page navigations using a hybrid memory-first + sessionStorage approach.

## Features

-   **Memory-first performance**: Active conversations are cached in memory for fast access
-   **SessionStorage backup**: Conversations persist across page reloads and navigation
-   **Efficient serialization**: Only essential message content is stored, not redundant history data
-   **Automatic cleanup**: Old conversations are automatically cleaned up to manage storage limits
-   **Session-based**: Each conversation is tied to a sessionId for isolation

## Usage

### Basic Usage with Persistence

```typescript
import { useAgentChat } from '@automattic/agenttic-client';

function ChatComponent() {
  const { state, sendMessage, resetConversation } = useAgentChat({
    agentId: 'your-agent-id',
    sessionId: 'user-session-123', // Optional: defaults to 'default-session'
    // ... other config
  });

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
      // Conversation is automatically persisted
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReset = async () => {
    await resetConversation(); // Clears both state and persistent storage
  };

  return (
    <div>
      {state.conversationHistory.map((message, index) => (
        <div key={index}>
          <strong>{message.role}:</strong> {/* render message content */}
        </div>
      ))}
      {/* Your chat UI */}
    </div>
  );
}
```

### Session Management

```typescript
// Different sessions maintain separate conversation histories
const userSession = useAgentChat( {
	agentId: 'agent-1',
	sessionId: 'user-123',
} );

const adminSession = useAgentChat( {
	agentId: 'agent-1',
	sessionId: 'admin-456',
} );

// Each will have independent conversation history
```

### Manual Storage Operations

```typescript
import {
	clearAllConversations,
	clearConversation,
	getStoredSessionIds,
	loadConversation,
} from '@agenttic/client/react/conversationStorage';

// Get all stored session IDs
const sessionIds = await getStoredSessionIds();

// Load a specific conversation
const messages = await loadConversation( 'session-123' );

// Clear a specific conversation
await clearConversation( 'session-123' );

// Clear all conversations
await clearAllConversations();
```

## How It Works

### Storage Strategy

1. **In-Memory Cache**: Active conversations are kept in memory for fast access
2. **SessionStorage Persistence**: Conversations are serialized and stored in browser sessionStorage
3. **Efficient Serialization**: Only essential message content is stored:
    - Text content
    - Tool call summaries
    - Tool result summaries
    - Timestamps and metadata

### Automatic Persistence

-   Conversations are automatically loaded when the hook initializes
-   New messages are immediately persisted after being added to state
-   Tool interactions are captured and stored efficiently
-   Storage operations are non-blocking and handle errors gracefully

### Storage Limits

-   **Cache Limit**: Maximum 10 conversations in memory (configurable)
-   **SessionStorage**: ~5MB browser limit (shared across all tabs)
-   **Automatic Cleanup**: Old conversations are removed when limits are reached

## Error Handling

Storage operations are designed to fail gracefully:

-   If sessionStorage is full, warnings are logged but functionality continues
-   If stored data is corrupted, it's ignored and a fresh conversation starts
-   Network errors don't affect local conversation state

## Performance Considerations

-   **Memory Usage**: Each cached conversation uses minimal memory (text + metadata only)
-   **Storage Size**: Compressed message format reduces sessionStorage usage
-   **Load Time**: Conversations load instantly from memory cache
-   **Persistence**: Non-blocking async operations don't affect UI responsiveness

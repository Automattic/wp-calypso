# @automattic/agenttic-ui

React UI components for AI agent chat interfaces. A pure UI layer designed to work seamlessly with `@automattic/agenttic-client` hooks or any agent communication system.

## Installation

```bash
npm install @automattic/agenttic-ui
```

## Key Features

- Pure UI components with no agent communication logic
- Floating and embedded chat variants
- Smooth animations and drag-and-drop positioning
- Message actions and markdown rendering
- TypeScript support with comprehensive types
- Storybook component documentation
- Modular component architecture for custom layouts

## Quick Start

### Complete Chat Interface

```tsx
import { useAgentChat } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';

function ChatApplication() {
  const {
    messages,
    isProcessing,
    error,
    onSubmit,
    suggestions,
    clearSuggestions,
    messageRenderer
  } = useAgentChat({
    agentId: 'big-sky',
    sessionId: 'my-session'
  });

  return (
    <AgentUI
      messages={messages}
      isProcessing={isProcessing}
      error={error}
      onSubmit={onSubmit}
      suggestions={suggestions}
      clearSuggestions={clearSuggestions}
      messageRenderer={messageRenderer}
      variant="floating"
      placeholder="Ask me anything..."
    />
  );
}
```

### Embedded Chat

```tsx
<AgentUI
  messages={messages}
  isProcessing={isProcessing}
  error={error}
  onSubmit={onSubmit}
  variant="embedded"
  placeholder="How can I help you?"
/>
```

## Core Components

### AgentUI

The main component that provides a complete chat interface.

```tsx
interface AgentUIProps {
  // Core chat data
  messages: Message[];
  isProcessing: boolean;
  error?: string | null;
  onSubmit: (message: string) => void;

  // UI configuration
  variant?: 'floating' | 'embedded';
  placeholder?: string;
  triggerIcon?: React.ReactNode;
  notice?: NoticeConfig;
  emptyView?: React.ReactNode;

  // Chat state management (floating variant)
  floatingChatState?: ChatState;
  onOpen?: () => void;
  onExpand?: () => void;
  onClose?: () => void;

  // Suggestions
  suggestions?: Suggestion[];
  clearSuggestions?: () => void;

  // Message rendering
  messageRenderer?: ComponentType<{ children: string }>;

  // Styling
  className?: string;
  style?: React.CSSProperties;
}
```

**Variants:**
- `floating` - Draggable chat widget with collapsed/compact/expanded states
- `embedded` - Fixed chat interface for integration in existing layouts

### Individual Components

For custom chat layouts, use individual components:

```tsx
import {
  Chat,
  Messages,
  Message,
  ChatInput,
  Suggestions
} from '@automattic/agenttic-ui';

function CustomChat() {
  return (
    <div className="my-chat-container">
      <Messages messages={messages} messageRenderer={messageRenderer} />
      <Suggestions 
        suggestions={suggestions} 
        onSuggestionClick={onSubmit}
        onClear={clearSuggestions}
      />
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={onSubmit}
        placeholder="Type a message..."
        isProcessing={isProcessing}
      />
    </div>
  );
}
```

## Component APIs

### Chat

Main chat component supporting both floating and embedded variants.

```tsx
<Chat
  messages={messages}
  isProcessing={isProcessing}
  error={error}
  onSubmit={onSubmit}
  variant="floating"
  placeholder="Ask anything..."
  suggestions={suggestions}
  clearSuggestions={clearSuggestions}
  messageRenderer={messageRenderer}
/>
```

### Messages

Container for displaying message history.

```tsx
<Messages 
  messages={messages}
  messageRenderer={messageRenderer}
  emptyView={<div>No messages yet</div>}
/>
```

### Message

Individual message component with action support.

```tsx
<Message
  message={message}
  messageRenderer={messageRenderer}
  showIcon={true}
/>
```

### ChatInput

Text input with auto-resize and submit handling.

```tsx
<ChatInput
  value={value}
  onChange={setValue}
  onSubmit={handleSubmit}
  onKeyDown={handleKeyDown}
  placeholder="Type a message..."
  isProcessing={false}
  textareaRef={textareaRef}
/>
```

### Suggestions

Quick action suggestions for users.

```tsx
<Suggestions
  suggestions={[
    { id: '1', label: 'Help me code', prompt: 'Can you help me write code?' },
    { id: '2', label: 'Explain concept', prompt: 'Explain this concept to me' }
  ]}
  onSuggestionClick={onSubmit}
  onClear={clearSuggestions}
/>
```

## Hooks

### useChat

Manages chat state for floating variant.

```tsx
const {
  state,        // 'collapsed' | 'compact' | 'expanded'
  setState,
  isOpen,       // boolean
  open,         // () => void
  close,        // () => void
  toggle        // () => void
} = useChat(initialState);
```

### useInput

Manages text input state with auto-resize and keyboard handling.

```tsx
const {
  value,
  setValue,
  clear,
  textareaRef,
  handleKeyDown,
  adjustHeight
} = useInput({
  value: inputValue,
  setValue: setInputValue,
  onSubmit: handleSubmit,
  isProcessing: false
});
```

## Icons

Pre-built icon components for consistent UI:

```tsx
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  CopyIcon,
  StopIcon,
  ArrowUpIcon,
  XIcon,
  BigSkyIcon,
  StylesIcon
} from '@automattic/agenttic-ui';
```

## Type Definitions

```tsx
interface Message {
  id: string;
  role: 'user' | 'agent';
  content: Array<{
    type: 'text' | 'image_url' | 'component';
    text?: string;
    image_url?: string;
    component?: React.ComponentType;
    componentProps?: any;
  }>;
  timestamp: number;
  archived: boolean;
  showIcon: boolean;
  icon?: string;
  actions?: MessageAction[];
}

interface MessageAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: (message: Message) => void | Promise<void>;
  tooltip?: string;
  disabled?: boolean;
}

interface Suggestion {
  id: string;
  label: string;
  prompt: string;
}

interface NoticeConfig {
  icon?: React.ReactNode;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

type ChatState = 'collapsed' | 'compact' | 'expanded';
```

## Styling

### CSS Import

Components automatically import their styles. For manual control:

```css
/* In your CSS */
@import '@automattic/agenttic-ui/index.css';
```

```tsx
// In JavaScript/TypeScript
import '@automattic/agenttic-ui/index.css';
```

### Customization

Components use CSS Modules with design tokens. Override styles using CSS custom properties:

```css
:root {
  --agenttic-primary-color: #your-brand-color;
  --agenttic-border-radius: 8px;
  --agenttic-spacing-unit: 16px;
}
```

## Advanced Usage

### Custom Message Renderer

Provide a custom markdown renderer:

```tsx
import { ReactMarkdown } from 'react-markdown';

const customRenderer = ({ children }: { children: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]}
    components={{
      code: ({ children }) => <code className="custom-code">{children}</code>
    }}
  >
    {children}
  </ReactMarkdown>
);

<AgentUI
  messages={messages}
  messageRenderer={customRenderer}
  // ... other props
/>
```

### Message Actions

Messages can include interactive actions:

```tsx
const messagesWithActions = messages.map(message => ({
  ...message,
  actions: message.role === 'agent' ? [
    {
      id: 'copy',
      icon: <CopyIcon />,
      label: 'Copy',
      onClick: () => navigator.clipboard.writeText(message.content[0].text)
    },
    {
      id: 'feedback',
      icon: <ThumbsUpIcon />,
      label: 'Good response',
      onClick: () => console.log('Positive feedback')
    }
  ] : []
}));
```

### Controlled Chat State

For floating variant, control the chat state externally:

```tsx
const [chatState, setChatState] = useState<ChatState>('collapsed');

<AgentUI
  variant="floating"
  floatingChatState={chatState}
  onOpen={() => setChatState('compact')}
  onExpand={() => setChatState('expanded')}
  onClose={() => setChatState('collapsed')}
  // ... other props
/>
```

### Custom Empty View

Provide custom content when there are no messages:

```tsx
<AgentUI
  messages={[]}
  emptyView={
    <div className="welcome-message">
      <h3>Welcome to AI Assistant</h3>
      <p>I'm here to help you with any questions.</p>
    </div>
  }
  // ... other props
/>
```

## Development

```bash
# Build the package
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Start Storybook
pnpm storybook
```

## Storybook Documentation

Interactive component documentation is available via Storybook:

```bash
pnpm storybook
```

Visit `http://localhost:6006` to explore component examples and documentation.

## Integration with agenttic-client

This UI package is designed to work seamlessly with `@automattic/agenttic-client`:

```tsx
import { useAgentChat } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';

function App() {
  const agentProps = useAgentChat({
    agentId: 'big-sky',
    // ... configuration
  });

  return <AgentUI {...agentProps} variant="floating" />;
}
```

The `useAgentChat` hook returns props that match the `AgentUI` interface perfectly, making integration seamless.
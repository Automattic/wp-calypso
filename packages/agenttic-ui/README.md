# @automattic/agenttic-ui

React UI components for AI agent chat interfaces. A pure UI layer designed to work seamlessly with `@automattic/agenttic-client` hooks or any agent communication system.

## Installation

```bash
npm install @automattic/agenttic-ui
```

## Key Features

-   Pure UI components with no agent communication logic
-   Composable architecture for complete layout flexibility
-   Floating and embedded chat variants
-   Controlled input support for external value management
-   Smooth animations and drag-and-drop positioning
-   Message actions and markdown rendering
-   Request cancellation UI with stop button functionality
-   TypeScript support with comprehensive types
-   Storybook component documentation

## Quick Start

### Complete Chat Interface (Convenience API)

```tsx
import { useAgentChat } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';

function ChatApplication() {
	const {
		messages,
		isProcessing,
		error,
		onSubmit,
		abortCurrentRequest,
		suggestions,
		clearSuggestions,
		messageRenderer,
	} = useAgentChat( {
		agentId: 'big-sky',
		sessionId: 'my-session',
	} );

	return (
		<AgentUI
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			onStop={ abortCurrentRequest }
			suggestions={ suggestions }
			clearSuggestions={ clearSuggestions }
			messageRenderer={ messageRenderer }
			variant="floating"
			placeholder="Ask me anything..."
		/>
	);
}
```

### Composable Architecture

For complete control over layout and component ordering:

```tsx
import { AgentUI } from '@automattic/agenttic-ui';

function CustomChatLayout() {
	return (
		<AgentUI.Container
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			onStop={ abortCurrentRequest }
			variant="embedded"
		>
			<AgentUI.ConversationView>
				<AgentUI.Header />
				<AgentUI.Messages />
				<AgentUI.Footer>
					<AgentUI.Notice />
					<AgentUI.Input />
				</AgentUI.Footer>
				<AgentUI.Suggestions />
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
```

### Controlled Input

External control of input value and changes:

```tsx
function ExternallyControlledChat() {
	const [ inputValue, setInputValue ] = useState( '' );

	return (
		<AgentUI
			messages={ messages }
			isProcessing={ isProcessing }
			onSubmit={ onSubmit }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			variant="embedded"
		/>
	);
}
```

## Architecture

### AgentUI Components

**AgentUI** - Convenience wrapper with default layout
**AgentUI.Container** - Root container with state management and context
**AgentUI.ConversationView** - Conversation layout wrapper
**AgentUI.Header** - Chat header with close/expand buttons
**AgentUI.Messages** - Message history display
**AgentUI.Footer** - Footer wrapper for input and notice
**AgentUI.Input** - Text input with auto-resize
**AgentUI.Notice** - Error and notification display
**AgentUI.Suggestions** - Quick action suggestions

### AgentUIProps Interface

```tsx
interface AgentUIProps {
	// Core chat data
	messages: Message[];
	isProcessing: boolean;
	error?: string | null;
	onSubmit: ( message: string ) => void;
	onStop?: () => void;

	// UI configuration
	variant?: 'floating' | 'embedded';
	placeholder?: string | string[];
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
	messageRenderer?: ComponentType< { children: string } >;

	// Controlled input (optional)
	inputValue?: string;
	onInputChange?: ( value: string ) => void;

	// Styling
	className?: string;
	style?: React.CSSProperties;
}
```

## Usage Patterns

### Flexible Component Ordering

Place suggestions anywhere in your layout:

```tsx
<AgentUI.Container {...props}>
  <AgentUI.ConversationView>
    <AgentUI.Messages />
    <AgentUI.Suggestions /> {/* Above input */}
    <AgentUI.Footer>
      <AgentUI.Input />
    </AgentUI.Footer>
  </AgentUI.ConversationView>
</AgentUI.Container>

// Or below input:
<AgentUI.Container {...props}>
  <AgentUI.ConversationView>
    <AgentUI.Messages />
    <AgentUI.Footer>
      <AgentUI.Input />
    </AgentUI.Footer>
    <AgentUI.Suggestions /> {/* Below input */}
  </AgentUI.ConversationView>
</AgentUI.Container>
```

### Individual Components

Use individual components for complete customization:

```tsx
import {
	Messages,
	Message,
	ChatInput,
	Suggestions,
} from '@automattic/agenttic-ui';

function FullyCustomChat() {
	return (
		<div className="my-chat-container">
			<Messages
				messages={ messages }
				messageRenderer={ messageRenderer }
			/>
			<ChatInput
				value={ inputValue }
				onChange={ setInputValue }
				onSubmit={ onSubmit }
				placeholder="Type a message..."
				isProcessing={ isProcessing }
			/>
			<Suggestions
				suggestions={ suggestions }
				onSuggestionClick={ onSubmit }
				onClear={ clearSuggestions }
			/>
		</div>
	);
}
```

### Request Cancellation

Stop button appears automatically during processing:

```tsx
<AgentUI
	isProcessing={ isProcessing }
	onStop={ abortCurrentRequest }
	// Submit button becomes stop button when processing
/>
```

### Custom Message Renderer

```tsx
import { ReactMarkdown } from 'react-markdown';

const customRenderer = ( { children }: { children: string } ) => (
	<ReactMarkdown remarkPlugins={ [ remarkGfm ] }>{ children }</ReactMarkdown>
);

<AgentUI messageRenderer={ customRenderer } />;
```

### Chat State Control

For floating variant, control state externally:

```tsx
const [ chatState, setChatState ] = useState< ChatState >( 'collapsed' );

<AgentUI
	variant="floating"
	floatingChatState={ chatState }
	onOpen={ () => setChatState( 'compact' ) }
	onExpand={ () => setChatState( 'expanded' ) }
	onClose={ () => setChatState( 'collapsed' ) }
/>;
```

## Hooks

### useChat

Manages floating chat state:

```tsx
const {
	state, // 'collapsed' | 'compact' | 'expanded'
	setState,
	isOpen, // boolean
	open, // () => void
	close, // () => void
	toggle, // () => void
} = useChat( initialState );
```

### useInput

Manages input state with auto-resize:

```tsx
const { value, setValue, clear, textareaRef, handleKeyDown, adjustHeight } =
	useInput( {
		value: inputValue,
		setValue: setInputValue,
		onSubmit: handleSubmit,
		isProcessing: false,
	} );
```

## Type Definitions

```tsx
interface Message {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'image_url' | 'component';
		text?: string;
		image_url?: string;
		component?: React.ComponentType;
		componentProps?: any;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: MessageAction[];
}

interface MessageAction {
	id: string;
	icon?: React.ReactNode;
	label: string;
	onClick: ( message: Message ) => void | Promise< void >;
	tooltip?: string;
	disabled?: boolean;
	pressed?: boolean;
	showLabel?: boolean;
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

```tsx
import '@automattic/agenttic-ui/index.css';
```

### CSS Scoping

All styles are scoped to `.agenttic` class to prevent conflicts.

### Customization

Override CSS custom properties:

```css
.agenttic {
	--color-primary: #your-brand-color;
	--color-background: #ffffff;
	--color-foreground: #000000;
}

.agenttic [data-slot='chat-footer'] {
	--color-background: oklch( 1 0 0 );
	--color-primary: #your-brand-color;
}
```

## Icons

Pre-built icon components:

```tsx
import {
	ThumbsUpIcon,
	ThumbsDownIcon,
	CopyIcon,
	StopIcon,
	ArrowUpIcon,
	XIcon,
	BigSkyIcon,
	StylesIcon,
} from '@automattic/agenttic-ui';
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

## Integration with agenttic-client

```tsx
import { useAgentChat } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';

function App() {
	const agentProps = useAgentChat( {
		agentId: 'big-sky',
	} );

	return <AgentUI { ...agentProps } variant="floating" />;
}
```

The `useAgentChat` hook returns props that match the `AgentUI` interface.

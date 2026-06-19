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

### Typing Status Tracking

Track when the user is actively typing in the input field:

```tsx
function ChatWithTypingStatus() {
	const [ isTyping, setIsTyping ] = useState( false );

	return (
		<AgentUI
			messages={ messages }
			isProcessing={ isProcessing }
			onSubmit={ onSubmit }
			onTypingStatusChange={ setIsTyping }
			variant="embedded"
		/>
	);
}
```

The `onTypingStatusChange` callback is triggered when the typing status changes. The user is considered "typing" when:
- The input field is focused
- The browser window is focused  
- The input contains text (length > 0)

## Architecture

### Portable Question Choices

Agentic question renderers should use a portable question payload so product
agents can ask lightweight structured questions inline in chat without coupling
the UI to one product or workflow.

```ts
interface QuestionPrompt {
	question: string;
	choices: QuestionChoice[];
	allow_freeform?: boolean;
	freeform_label?: string;
	freeform_placeholder?: string;
}

interface QuestionChoice {
	label: string;
	message?: string;
	description?: string;
	presentation?: {
		swatches?: string[];
		font_sample?: {
			heading?: string;
			body?: string;
			heading_font?: string;
			body_font?: string;
		};
		image?: {
			url: string;
			alt?: string;
		};
		layout_hint?: string;
	};
}
```

All `presentation` fields are optional. Renderers should fall back to the choice
label and description when presentation metadata is absent or unsupported.

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
	triggerTitle?: string; // Title shown next to the icon in the `minimized` state (defaults to `Ask AI`)
	notice?: NoticeConfig;
	emptyView?: React.ReactNode;
	showAgentIcon?: boolean; // Show an avatar next to agent text responses (default false). See "Agent Avatar".

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

	// Typing status tracking
	onTypingStatusChange?: ( isTyping: boolean ) => void;

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

### Content Types

Content items can have different types that determine how they're displayed:

- `type: 'text'` - Normal text content (visible)
- `type: 'image_url'` - Image content (visible)
- `type: 'component'` - React component (visible)
- `type: 'context'` - Context information sent as text to the agent but hidden from UI

```tsx
// Example: Mixing visible and context content
const messages = [
	{
		id: '1',
		role: 'user',
		content: [ { type: 'text', text: 'Take me to the dashboard' } ],
		timestamp: Date.now(),
		archived: false,
		showIcon: true,
	},
	{
		id: '2',
		role: 'user',
		content: [
			{
				type: 'context', // Hidden from UI, sent to agent for context
				text: 'Navigation completed. Dashboard loaded successfully.',
			},
		],
		timestamp: Date.now(),
		archived: false,
		showIcon: true,
	},
	{
		id: '3',
		role: 'agent',
		content: [
			{ type: 'text', text: "I've taken you to the dashboard." },
		],
		timestamp: Date.now(),
		archived: false,
		showIcon: true,
	},
];

<AgentUI messages={ messages } />;
// Only messages 1 and 3 will be visible (message 2 has only context content)

// Example: Message with both visible and context content
const mixedMessage = {
	id: '4',
	role: 'user',
	content: [
		{ type: 'text', text: 'Here are your analytics' },
		{ type: 'context', text: 'page: /analytics, loaded: true' },
	],
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
};
// The context content will be filtered out, only "Here are your analytics" is visible
```

### Agent Avatar

Set `showAgentIcon` on the chat to render an avatar next to the agent's spoken
responses. It is **off by default**, so existing embeds are unaffected.

The avatar only appears when **all** of these hold for a message:

1. `showAgentIcon` is enabled on the chat (`<AgentUI showAgentIcon />`, or the
   prop on `<Chat>` — see note below).
2. The message's own `showIcon: true` flag is set.
3. The message is from the agent (`role: 'agent'`).
4. The message has at least one non-empty `text` content block.

Condition 4 means component-only messages (pickers, confirmations) and
context/data blocks intentionally show no avatar, so the icon sits next to what
the agent _said_, not next to UI it surfaced. A common gotcha: turning on
`showAgentIcon` but seeing no avatar usually means the messages are missing
`showIcon: true`.

> **Note:** the composable `AgentUIContainer` path reads `showAgentIcon` from
> context, so nested `Messages`/`Message` inherit it automatically. The
> monolithic `<Chat>` component is prop-driven — pass `showAgentIcon` to it
> explicitly (same as `messageRenderer`).

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

The `minimized` state docks a bar to the bottom edge showing the trigger icon
and a title (`triggerTitle`, defaults to `Ask AI`); clicking it expands the chat:

```tsx
<AgentUI
	variant="floating"
	floatingChatState="minimized"
	triggerTitle="Ask AI"
/>;
```

## Hooks

### useChat

Manages floating chat state:

```tsx
const {
	state, // 'collapsed' | 'minimized' | 'compact' | 'expanded'
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
		type: 'text' | 'image_url' | 'component' | 'context';
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
	disabled?: boolean;
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
	icon?: React.ReactNode | null | false;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	dismissible?: boolean;
	onDismiss?: () => void;
}

type ChatState = 'collapsed' | 'minimized' | 'compact' | 'expanded';
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

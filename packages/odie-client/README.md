# Odie Client - Chat Integration v1.0.0

## Overview

Odie Assistant Chat is a React component designed for WordPress.com projects. This documentation is intended for developers integrating this component into their applications.

<div align="center">
  <img src="https://github.com/Automattic/wp-calypso/assets/5689927/a4e6ece6-4d5e-4888-a863-a99f5ea7120f" />
</div>

## Installation

```bash
npm install @automattic/odie-client
```

## Usage

### Basic Integration

```tsx
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';

const MyApp = () => (
	<OdieAssistantProvider botNameSlug="wpcom-support-chat">
		<OdieAssistant />
	</OdieAssistantProvider>
);
```

### Component Props

`OdieAssistantProviderProps`

- `botName?: string` - Display the bot's name in the chat.
- `botNameSlug: OdieAllowedBots` - Configure bot settings in WordPress.com.
- `enabled?: boolean` - Toggle chat component visibility.
- `initialUserMessage?: string | null | undefined` - Set an initial message from the user.
- `isMinimized?: boolean` - Tells if parent component app is minimized.
- `extraContactOptions?: ReactNode` - Show extra options for exiting the chat.
- `logger?: (message: string, properties: Record<string, unknown>) => void` - Log user events.
- `loggerEventNamePrefix?: string` - Prefix for logged events.
- `children?: ReactNode` - Child components within the provider.

## Odie Storage

Odie stores user's chat ID in Calypso's user preferences. So that the chat continuity works across Calypso, wp-admin, and wp-admin in Atomic sites.

### Types

```tsx
type OdieStorageKey = 'chat_id' | 'last_chat_id';
```

### Methods

```tsx
import {
	useGetOdieStorage,
	useSetOdieStorage,
} from '@automattic/odie-client';

// Usage examples
function Examples() {
	const updateChatId = useSetOdieStorage( 'chat_id' )
	updateChatId( 'new_chat_id' );

	const chatId = useGetOdieStorage( 'chat_id' );
}
```

_Note: Setting `chat_id` fetches a new chat from the server and also sets `last_chat_id`. Clearing `chat_id` does not clear `last_chat_id`._

## Context API

### Context properties

```tsx
const defaultContextInterfaceValues = {
	addMessage: noop, // Function to add a new message to the chat.
	botName: 'Wapuu', // Default name of the chat bot.
	botNameSlug: 'wpcom-support-chat', // Identifier for the chat bot configuration.
	chat: { context: { section_name: '', site_id: null }, messages: [] }, // Current chat state, including context and messages.
	clearChat: noop, // Function to clear the current chat.
	isLoadingChat: false, // Flag indicating if the chat is loading.
	isLoading: false, // Flag for general loading state.
	isMinimized: false, // Flag to check if the chat is minimized.
	isNudging: false, // Flag to check if a nudge action is occurring.
	isVisible: false, // Flag to check if the chat is visible.
	lastNudge: null, // Information about the last nudge action.
	sendNudge: noop, // Function to trigger a nudge action.
	setChat: noop, // Function to set the current chat.
	setIsLoadingChat: noop, // Function to set the chat loading state.
	setMessageLikedStatus: noop, // Function to set the liked status of a message.
	setContext: noop, // Function to set the chat context.
	setIsNudging: noop, // Function to set the nudge state.
	setIsVisible: noop, // Function to set the visibility of the chat.
	setIsLoading: noop, // Function to set the general loading state.
	trackEvent: noop, // Function to track events.
	updateMessage: noop, // Function to update a message in the chat.
};
```

## Authentication

Authentication is managed by Calypso. Currently, the Odie client is designed to work only within Calypso and does not support external bearer tokens.

## Advanced Example

```tsx
import OdieAssistantProvider, {
	OdieAssistant,
	useOdieAssistantContext,
} from '@automattic/odie-client';

const MyApp = () => {
	const { clearChat } = useOdieAssistantContext();
	return (
		<OdieAssistantProvider botNameSlug="wpcom-support-chat">
			<div className="custom-class">
				<BackButton className="back-button-class" />
				<EllipsisMenu popoverClassName="menu-class" position="bottom">
					<PopoverMenuItem onClick={ () => clearChat() } className="menu-item-class">
						<Gridicon icon="comment" />
						Start a New Chat
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
			<OdieAssistant />
		</OdieAssistantProvider>
	);
};
```

## Versioning

This document applies to Odie Assistant Chat version 1.0.0. Future versions may introduce changes not covered in this guide.

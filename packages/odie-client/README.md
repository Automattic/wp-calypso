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
- `children?: ReactNode` - Child components within the provider.

## Context API

### Context properties

```tsx
const defaultContextInterfaceValues = {
	addMessage: noop, // Function to add a new message to the chat.
	botName: 'Wapuu', // Default name of the chat bot.
	botNameSlug: 'wpcom-support-chat', // Identifier for the chat bot configuration.
	chat: { context: { section_name: '', site_id: null }, messages: [] }, // Current chat state, including context and messages.
	clearChat: noop, // Function to clear the current chat.
	isLoading: false, // Flag for general loading state.
	isMinimized: false, // Flag to check if the chat is minimized.
	setMessageLikedStatus: noop, // Function to set the liked status of a message.
	setIsLoading: noop, // Function to set the general loading state.
	trackEvent: noop, // Function to track events.
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

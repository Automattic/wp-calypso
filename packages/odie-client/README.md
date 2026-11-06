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
- `botNameSlug: OdieAllowedBots` - Set the botSlug that will be used when creating interactions.
- `enabled?: boolean` - Toggle chat component visibility.
- `initialUserMessage?: string | null | undefined` - Set an initial message from the user.
- `isMinimized?: boolean` - Tells if parent component app is minimized.
- `children?: ReactNode` - Child components within the provider.

## Context API

### Context properties

```tsx
const defaultContextInterfaceValues = {
	addMessage: noop, // Function to add a new message to the chat.
	botName: 'Wapuu', // Default name of the chat bot.
	botNameSlug: 'wpcom-support-chat', // Identifier for the chat bot configuration. It is only used when creating new interactions. Existing interactions used their `botSlug` attribute.
	chat: { context: { section_name: '', site_id: null }, messages: [] }, // Current chat state, including context and messages.
	clearChat: noop, // Function to clear the current chat.
	isLoading: false, // Flag for general loading state.
	isMinimized: false, // Flag to check if the chat is minimized.
	setIsLoading: noop, // Function to set the general loading state.
	trackEvent: noop, // Function to track events.
};
```

## Call an HE pilot

Some logged-in users start their new chats on a separate bot, `ODIE_CALL_AN_HE_BOT_SLUG`, instead of `newInteractionsBotSlug`. That bot can ask a Happiness Engineer a question and relay the answer into the chat later, as a new bot message with no customer message in between.

- Who: `isCallAnHESampledUser` in `src/utils`, one user in twenty by `ID`, plus every user with an `@automattic.com` email. The rule is hard-coded, so changing the sample means a new build.
- Where the swap happens: the provider's `useSelect`, only when the bot for new chats is the normal support bot. A bot the Help Center store chose, and chats that already exist, keep their bot.
- How the answer shows up: `usePollForDelayedReplies` in `src/hooks` fetches the chat every 5 seconds while it is on that bot, loaded, visible and not minimized, and adds the bot messages it does not have yet. It stops 20 minutes after the newest message, and for closed chats. Replies that ask for a human are left to the send handler.

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

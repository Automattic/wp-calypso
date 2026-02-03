import { useEffect, useMemo, useState } from '@wordpress/element';
import type { AgentMessage } from '../types/agenttic';

const getLastMessageByRole = ( messages: AgentMessage[], role: string ) => {
	const filtered = messages.filter( ( message ) => message.role === role );
	return filtered[ filtered.length - 1 ];
};

/**
 * Manages message display for Image Studio agent chat.
 *
 * - Filters messages to show only the last message when display is enabled
 * - Automatically enables display when user sends first message
 * - Returns empty array when display is disabled (modal just opened)
 * @param messages - Array of messages from agent chat (sorted by timestamp)
 * @returns Filtered array of messages to display
 */
export function useImageStudioMessageDisplay( messages?: AgentMessage[] ) {
	const [ displayMessagesInChat, setDisplayMessagesInChat ] = useState< boolean >( false );

	// Enable message display when user sends a message
	useEffect( () => {
		if ( messages?.length && ! displayMessagesInChat ) {
			const lastMessage = messages[ messages.length - 1 ];
			if ( lastMessage.role === 'user' ) {
				setDisplayMessagesInChat( true );
			}
		}
	}, [ messages, displayMessagesInChat ] );

	return useMemo( () => {
		if ( ! displayMessagesInChat || ! messages?.length ) {
			return [];
		}

		const lastUserMessage = getLastMessageByRole( messages, 'user' );
		const lastMessage = messages[ messages.length - 1 ];

		// If most recent message is from user, it's a new request. Don't show previous agent message.
		if ( lastMessage.role === 'user' ) {
			return lastUserMessage ? [ lastUserMessage ] : [];
		}

		// Otherwise, show last user and agent messages.
		const lastAgentMessage = getLastMessageByRole( messages, 'agent' );

		return [ lastUserMessage, lastAgentMessage ].filter( Boolean ) as typeof messages;
	}, [ messages, displayMessagesInChat ] );
}

import { useEffect, useRef } from 'react';
import { useOdieChat } from '../../data/use-odie-chat';
import { getIsRequestingHumanSupport } from '../../utils';

interface UseChatMessagesReturn {
	messages: import('../../types').Message[];
	replaceMessages: ( messages: import('../../types').Message[] ) => void;
}

/**
 * Syncs Odie chat data to message store.
 * Handles Odie-specific message filtering and loading states.
 */
export const useOdieChatSync = (
	odieId: number | null,
	conversationId: string | null,
	messages: UseChatMessagesReturn
) => {
	const { data: odieChat, isFetching, error } = useOdieChat( Number( odieId ) );
	// Use ref to store latest messages to avoid dependency issues
	const messagesRef = useRef( messages.messages );
	messagesRef.current = messages.messages;

	// Sync messages when Odie chat data changes
	useEffect( () => {
		if ( ! odieChat || isFetching ) {
			return;
		}

		// If we have a conversationId, we're in Zendesk mode
		// Don't sync Odie messages here - let zendesk sync handle the merge
		// This prevents overwriting transfer messages and Zendesk messages
		if ( conversationId ) {
			return;
		}

		// Filter out "requesting human support" messages
		// (these are handled separately during escalation)
		const filteredMessages = odieChat.messages
			.filter( ( msg ) => ! getIsRequestingHumanSupport( msg ) )
			.map( ( msg ) => ( {
				...msg,
				metadata: {
					...msg.metadata,
					// Ensure all Odie messages have local_timestamp for proper sorting
					local_timestamp: msg.metadata?.local_timestamp || Date.now() / 1000,
				},
			} ) );

		// Pure Odie chat - replace messages
		messages.replaceMessages( filteredMessages );
		// Only sync when source data changes, not when messages change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ odieChat, isFetching, conversationId, messages.replaceMessages ] );

	return {
		odieChat,
		isFetching,
		error,
		odieId: odieChat?.odieId ?? null,
		wpcomUserId: odieChat?.wpcomUserId ?? null,
	};
};

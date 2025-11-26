import { useState, useCallback } from 'react';
import { getMessageUniqueIdentifier } from '../../components/message/utils/get-message-unique-identifier';
import type { Message } from '../../types';

/**
 * Single source of truth for all chat messages.
 * Handles message CRUD operations and queries.
 * Note: Deduplication should be handled by callers before passing messages.
 */
export const useChatMessages = ( initialMessages: Message[] = [] ) => {
	const [ messages, setMessages ] = useState< Message[] >( initialMessages );

	// Add single message
	const addMessage = useCallback( ( message: Message ) => {
		setMessages( ( prev ) => [ ...prev, message ] );
	}, [] );

	// Add multiple messages
	const addMessages = useCallback( ( newMessages: Message[] ) => {
		setMessages( ( prev ) => [ ...prev, ...newMessages ] );
	}, [] );

	// Replace all messages (for initialization)
	const replaceMessages = useCallback( ( newMessages: Message[] ) => {
		setMessages( newMessages );
	}, [] );

	// Clear all messages
	const clearMessages = useCallback( () => {
		setMessages( [] );
	}, [] );

	// Remove message by ID
	const removeMessage = useCallback( ( messageId: string ) => {
		setMessages( ( prev ) =>
			prev.filter( ( msg ) => getMessageUniqueIdentifier( msg ) !== messageId )
		);
	}, [] );

	// Update an existing message by matching identifier (e.g., temporary_id)
	const updateMessage = useCallback(
		(
			updatedMessage: Message,
			matchBy: 'temporary_id' | 'message_id' | 'internal_message_id' = 'temporary_id'
		) => {
			setMessages( ( prev ) => {
				const matchValue =
					matchBy === 'temporary_id'
						? updatedMessage.metadata?.temporary_id
						: matchBy === 'message_id'
						? updatedMessage.message_id
						: updatedMessage.internal_message_id;

				if ( ! matchValue ) {
					console.warn( 'updateMessage: No match value found, adding as new message', {
						matchBy,
						updatedMessage,
					} );
					return [ ...prev, updatedMessage ];
				}

				const index = prev.findIndex( ( msg ) => {
					if ( matchBy === 'temporary_id' ) {
						return msg.metadata?.temporary_id === matchValue;
					}
					if ( matchBy === 'message_id' ) {
						return msg.message_id === matchValue;
					}
					return msg.internal_message_id === matchValue;
				} );

				if ( index === -1 ) {
					console.warn( 'updateMessage: Message not found, adding as new message', {
						matchBy,
						matchValue,
					} );
					return [ ...prev, updatedMessage ];
				}

				// Replace the message at the found index
				const updated = [ ...prev ];
				updated[ index ] = updatedMessage;
				return updated;
			} );
		},
		[]
	);

	// Query helpers
	const getMessagesByRole = useCallback(
		( role: string ) => {
			return messages.filter( ( msg ) => msg.role === role );
		},
		[ messages ]
	);

	// Get messages by source (odie, zendesk, or local)
	const getMessagesBySource = useCallback(
		( source: 'odie' | 'zendesk' | 'local' ) => {
			return messages.filter( ( msg ) => {
				if ( source === 'local' ) {
					return ! msg.message_id && ! msg.received;
				}
				if ( source === 'zendesk' ) {
					return !! ( msg.received || msg.metadata?.temporary_id );
				}
				if ( source === 'odie' ) {
					// Odie messages have both message_id and context object
					return !! ( msg.message_id && msg.context );
				}
				return false;
			} );
		},
		[ messages ]
	);

	return {
		messages,
		addMessage,
		addMessages,
		replaceMessages,
		clearMessages,
		removeMessage,
		updateMessage,
		getMessagesByRole,
		getMessagesBySource,
		setMessages, // Direct access for complex operations
	};
};

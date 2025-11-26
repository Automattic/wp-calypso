import { useEffect, useState, useRef } from 'react';
import { useGetZendeskConversation } from '../../data/use-get-zendesk-conversation';
import { getOdieTransferMessage } from '../../constants';
import { deduplicateZDMessages } from '../use-get-combined-chat';
import { getIsRequestingHumanSupport } from '../../utils';
import Smooch from 'smooch';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import type { OdieAllBotSlugs, Message } from '../../types';

interface UseChatMessagesReturn {
	messages: Message[];
	replaceMessages: ( messages: Message[] ) => void;
}

/**
 * Syncs Zendesk conversation data to message store.
 * Handles connection recovery, message deduplication, and Zendesk-specific logic.
 */
export const useZendeskChatSync = (
	conversationId: string | null,
	odieId: number | null,
	canConnect: boolean,
	isChatLoaded: boolean,
	botSlug: OdieAllBotSlugs,
	messages: UseChatMessagesReturn,
	odieChat: any // Pass odieChat directly to get Odie messages
) => {
	const getZendeskConversation = useGetZendeskConversation();
	const [ conversation, setConversation ] = useState< any >( null );
	const [ isFetching, setIsFetching ] = useState( !! conversationId );
	const [ error, setError ] = useState< Error | null >( null );
	// Use ref to store latest messages to avoid dependency issues
	const messagesRef = useRef( messages.messages );
	messagesRef.current = messages.messages;

	// Fetch and sync Zendesk conversation
	useEffect( () => {
		if ( ! conversationId || ! canConnect || ! isChatLoaded ) {
			return;
		}

		setError( null );

		getZendeskConversation( {
			chatId: odieId,
			conversationId: conversationId.toString(),
		} )
			?.then( ( conv ) => {
				if ( ! conv ) {
					throw new Error( 'Conversation not found' );
				}

				setConversation( conv );
				setError( null );

				// Load conversation in Smooch (for typing events)
				// Only call if Smooch is initialized (isChatLoaded should ensure this, but add safety check)
				try {
					Smooch.loadConversation( conv.id );
				} catch ( error ) {
					console.warn( 'Failed to load conversation in Smooch:', error );
					// Continue even if this fails - it's not critical
				}

				// Check if this is the same conversation (for connection recovery)
				// Look for Zendesk messages (have received timestamp) with matching conversationId
				const isSameConversation = messagesRef.current.some(
					( msg ) =>
						msg.received &&
						messagesRef.current.some( ( m ) => m.metadata?.conversationId === conv.id )
				);

				// Get existing Odie messages from odieChat (source of truth from API)
				// Filter out "requesting human support" messages as they're handled separately
				const existingOdieMessages =
					odieChat?.messages?.filter( ( msg: Message ) => ! getIsRequestingHumanSupport( msg ) ) ||
					[];
				// During connection recovery, preserve user messages that might be queued
				const existingUserMessages = isSameConversation
					? messagesRef.current.filter( ( msg ) => msg.role === 'user' && msg.received )
					: [];

				// Add transfer message if it doesn't already exist
				// IMPORTANT: Ensure transfer messages have unique identifiers
				const transferMessage = getOdieTransferMessage( botSlug ).map( ( msg ) => ( {
					...msg,
					// Ensure transfer message has a unique identifier
					internal_message_id: msg.internal_message_id || crypto.randomUUID(),
					metadata: {
						...msg.metadata,
						local_timestamp: msg.metadata?.local_timestamp || Date.now() / 1000,
					},
				} ) );

				// Combine: Odie messages + Transfer message(s) + User messages (if same conversation) + Zendesk messages
				// IMPORTANT: Include all Zendesk messages from conv.messages (they should include automatic messages)
				const allMessages = [
					...existingOdieMessages,
					// ...existingTransferMessages, // Preserve existing transfer messages
					...transferMessage, // Add new transfer message if needed
					...deduplicateZDMessages( [
						...existingUserMessages,
						...( conv.messages || [] ), // Include all Zendesk messages (including automatic ones)
					] ),
				];

				messages.replaceMessages( allMessages );
			} )
			.catch( ( err ) => {
				const error = err instanceof Error ? err : new Error( String( err ) );
				setError( error );
				recordTracksEvent( 'calypso_odie_zendesk_conversation_not_found', {
					conversation_id: conversationId,
					odie_id: odieId,
					error: error.message,
				} );
			} )
			.finally( () => {
				setIsFetching( false );
			} );
		// Only sync when source data changes, not when messages change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		conversationId,
		canConnect,
		isChatLoaded,
		odieId,
		getZendeskConversation,
		botSlug,
		messages.replaceMessages,
		odieChat,
	] );

	return {
		conversation,
		isFetching,
		error,
	};
};

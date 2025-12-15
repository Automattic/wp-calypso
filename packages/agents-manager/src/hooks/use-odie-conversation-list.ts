import {
	useGetSupportInteractions,
	useGetOdieConversations,
	type OdieConversation,
	type SupportInteraction,
} from '@automattic/odie-client';
import { useEffect, useMemo } from '@wordpress/element';
import type { Conversation } from '../types';

interface Result {
	conversations: Conversation[];
	isLoading: boolean;
	isError: boolean;
}

export default function useOdieConversationList(): Result {
	const {
		data: supportInteractions = [],
		isLoading: isLoadingInteractions,
		isError: isFetchingInteractionsError,
	} = useGetSupportInteractions( 'odie' );

	const {
		data: odieConversations = [],
		isLoading: isLoadingConversations,
		isError: isFetchingConversationsError,
		error,
	} = useGetOdieConversations( supportInteractions );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useOdieConversationList] Error loading conversation list:', error );
		}
	}, [ error ] );

	const conversations = useMemo(
		() => getConversationsWithSupportInteractions( odieConversations, supportInteractions ),
		[ odieConversations, supportInteractions ]
	);

	return {
		conversations,
		isLoading: isLoadingInteractions || isLoadingConversations,
		isError: isFetchingInteractionsError || isFetchingConversationsError,
	};
}

// Merges Odie conversations with their support interaction metadata.
function getConversationsWithSupportInteractions(
	odieConversations: OdieConversation[],
	supportInteractions: SupportInteraction[]
): Conversation[] {
	return odieConversations
		.map( ( conversation ) => {
			if ( ! conversation?.messages?.length ) {
				return null;
			}

			// Flattened conversation message
			const message = conversation.messages[ 0 ];

			// Validate message content
			if (
				typeof message?.text !== 'string' ||
				message.text.trim() === '' ||
				// '--' is a token returned for Odie conversations that should be forwarded to human support
				message.text.trim() === '--'
			) {
				return null;
			}

			const supportInteraction = supportInteractions.find( ( i ) =>
				i.events.some(
					( e ) => e.event_source === 'odie' && e.event_external_id === conversation.id
				)
			);

			// Skip if no valid support interaction
			if ( ! supportInteraction || ! supportInteraction.uuid ) {
				return null;
			}

			const { messages, ...restConversation } = conversation;

			return {
				...restConversation,
				type: 'odie',
				message,
				supportInteraction: {
					id: supportInteraction.uuid,
					status: supportInteraction.status || 'open',
					createdAt: supportInteraction.start_date
						? Date.parse( supportInteraction.start_date )
						: 0,
				},
			};
		} )
		.filter( Boolean ) as Conversation[];
}

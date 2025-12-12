import { ODIE_DEFAULT_BOT_SLUG_LEGACY, useGetSupportInteractions } from '@automattic/odie-client';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useEffect } from '@wordpress/element';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import getSupportInteractionId from '../utils/get-support-interaction-id';
import getTimestamp from '../utils/get-timestamp';
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

	const botSlugs = Array.from(
		new Set(
			supportInteractions.map( ( interaction ) => {
				// See `ODIE_DEFAULT_BOT_SLUG_LEGACY` for more information.
				return interaction.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
			} )
		)
	).join( ',' );

	const {
		data: conversations,
		isLoading: isLoadingConversations,
		isError: isFetchingConversationsError,
		error,
	} = useQuery< Conversation[], Error >( {
		queryKey: [ 'agents-manager-odie-conversation-list', botSlugs ],
		queryFn: async (): Promise< Conversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				truncation_method: 'first_message',
			} ).toString();

			const response: any[] = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/conversations/${ botSlugs }?${ queryParams }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/conversations/${ botSlugs }?${ queryParams }`,
						method: 'GET',
				  } );

			// Unify the conversation format and map to support interaction IDs, filtering out unmatched entries.
			const conversations = response
				.map( ( conversation ) => {
					const summary = conversation.first_message ?? conversation.last_message;
					// Odie conversations use support interaction ID as the identifier
					const id = getSupportInteractionId( 'odie', conversation.chat_id, supportInteractions );

					return id
						? {
								type: 'odie',
								id,
								createdAt: getTimestamp( conversation.created_at ),
								message: {
									received: getTimestamp( summary?.created_at ),
									role: summary?.role ?? 'bot',
									text: summary?.content ?? '',
								},
						  }
						: null;
				} )
				.filter( Boolean ) as Conversation[];

			return conversations;
		},
		enabled: supportInteractions.length > 0,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 30, // 30 seconds
	} );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useOdieConversationList] Error loading conversation list:', error );
		}
	}, [ error ] );

	return {
		conversations: conversations || [],
		isLoading: isLoadingInteractions || isLoadingConversations,
		isError: isFetchingInteractionsError || isFetchingConversationsError,
	};
}

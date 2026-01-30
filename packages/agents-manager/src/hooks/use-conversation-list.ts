import {
	listConversationsFromServer,
	createOdieBotId,
	type ServerConversationListItem,
} from '@automattic/agenttic-client';
import { useGetZendeskConversations } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { LocalConversationListItem } from '../types';
import { normalizeZendeskConversations } from '../utils/zendesk';
import { useShouldUseUnifiedAgent } from './use-should-use-unified-agent';
interface Options {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
}

export default function useConversationList( { agentId, authProvider }: Options ) {
	const urlSearchParams = new URLSearchParams( window.location.search );
	const hasAgentParam = urlSearchParams.has( 'agent' );
	const botId = hasAgentParam ? agentId : createOdieBotId( agentId );

	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	// Only fetch Zendesk conversations if the unified agent flag is enabled
	const { conversations: zendeskConversations, isLoading: isLoadingZendeskConversations } =
		useGetZendeskConversations( !! shouldUseUnifiedAgent );

	const {
		data: conversations,
		isLoading,
		isError,
		error,
	} = useQuery< ServerConversationListItem[] >( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when `botId` changes
		queryKey: [ 'agents-manager-conversation-list', botId ],
		queryFn: async () => {
			const result = await listConversationsFromServer(
				botId,
				{
					apiBaseUrl: API_BASE_URL,
					authProvider,
				},
				true
			);
			return result;
		},
		enabled: !! botId,
	} );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversationList] Error loading conversation list:', error );
		}
	}, [ error ] );

	const mergedConversations: LocalConversationListItem[] = useMemo(
		() =>
			[ ...( conversations ?? [] ), ...normalizeZendeskConversations( zendeskConversations ) ].sort(
				( a, b ) => {
					// Sort by `first_message.created_at` descending (most recent first)
					// Note: Dates are in ISO format "2025-11-06T14:29:49.000Z"
					const timeA = new Date( a.first_message?.created_at || 0 ).getTime();
					const timeB = new Date( b.first_message?.created_at || 0 ).getTime();
					return timeB - timeA;
				}
			),
		[ conversations, zendeskConversations ]
	);

	return {
		conversations: mergedConversations,
		isLoading: isLoadingZendeskConversations || isLoading,
		isError,
	};
}

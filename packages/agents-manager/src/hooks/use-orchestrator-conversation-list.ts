import { listConversationsFromServer, createOdieBotId } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import getTimestamp from '../utils/get-timestamp';
import type { Conversation } from '../types';

interface Options {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
}

interface Result {
	conversations: Conversation[];
	isLoading: boolean;
	isError: boolean;
}

export default function useOrchestratorConversationList( {
	agentId,
	authProvider,
}: Options ): Result {
	const botId = createOdieBotId( agentId );

	const {
		data: conversations,
		isLoading,
		isError,
		error,
	} = useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when botId changes
		queryKey: [ 'agents-manager-orchestrator-conversation-list', botId ],
		queryFn: async (): Promise< Conversation[] > => {
			const response = await listConversationsFromServer( botId, {
				apiBaseUrl: API_BASE_URL,
				authProvider,
			} );

			// Unify the conversation format with other conversation lists.
			return response.map( ( conversation ) => {
				const summary = conversation.last_message;

				return {
					type: 'orchestrator',
					id: String( conversation.session_id ?? '' ),
					createdAt: getTimestamp( conversation.created_at ),
					message: {
						received: getTimestamp( summary?.created_at ),
						role: summary?.role ?? 'bot',
						text: summary?.content ?? '',
					},
				};
			} );
		},
		enabled: !! botId,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 30, // 30 seconds
	} );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useOrchestratorConversationList] Error loading conversation list:', error );
		}
	}, [ error ] );

	return {
		conversations: conversations || [],
		isLoading,
		isError,
	};
}

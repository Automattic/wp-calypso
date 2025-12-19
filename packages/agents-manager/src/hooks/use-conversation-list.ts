import {
	listConversationsFromServer,
	createOdieBotId,
	type ServerConversationListItem,
} from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import { API_BASE_URL } from '../constants';

interface Options {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
}

interface Result {
	conversations: ServerConversationListItem[];
	isLoading: boolean;
	isError: boolean;
}

export default function useConversationList( { agentId, authProvider }: Options ): Result {
	const botId = createOdieBotId( agentId );

	const {
		data: conversations,
		isLoading,
		isError,
		error,
	} = useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when `botId` changes
		queryKey: [ 'agents-manager-conversation-list', botId ],
		queryFn: async () => {
			const result = await listConversationsFromServer( botId, {
				apiBaseUrl: API_BASE_URL,
				authProvider,
			} );

			// Sort by `last_message.created_at` descending (most recent first)
			// Note: Dates are in MySQL format "2025-11-06 14:29:49"
			const sorted = result.sort( ( a, b ) => {
				const timeA = new Date( a.last_message?.created_at || 0 ).getTime();
				const timeB = new Date( b.last_message?.created_at || 0 ).getTime();
				return timeB - timeA;
			} );

			return sorted;
		},
		enabled: !! botId,
	} );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversationList] Error loading conversation list:', error );
		}
	}, [ error ] );

	return {
		conversations: conversations || [],
		isLoading,
		isError,
	};
}

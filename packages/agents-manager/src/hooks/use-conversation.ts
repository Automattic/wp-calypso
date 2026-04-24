import { loadAllMessagesFromServer, type Message } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { isFreshSession } from '../utils/agent-session';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

interface Config {
	maxPages?: number;
	enabled?: boolean;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data: { messages: Message[]; sessionId?: string } | undefined;
	isLoading: boolean;
	isError: boolean;
}

/**
 * Fetches a conversation from the server when a `sessionId` is available.
 */
export default function useConversation( {
	maxPages = 10,
	enabled = true,
	onSuccess = () => {},
}: Config ): Result {
	const { agentConfig } = useAgentsManagerContext();
	const { agentId, sessionId, authProvider } = agentConfig!;

	// Keep a ref to the latest callback to avoid re-triggering effects when it changes.
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	const { data, isLoading, isError, error } = useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when sessionId changes
		queryKey: [ 'agents-manager-conversation', sessionId ],
		queryFn: async () => {
			const urlSearchParams = new URLSearchParams( window.location.search );
			const hasAgentParam = urlSearchParams.has( 'agent' );
			const botId = getConversationBotId( agentId, hasAgentParam );

			return await loadAllMessagesFromServer(
				sessionId,
				{
					botId,
					apiBaseUrl: API_BASE_URL,
					authProvider,
				},
				maxPages,
				true
			);
		},
		// Skip server fetch for brand-new client-created sessions — they
		// have no history to load and the extra round-trip blocks the
		// skeleton unnecessarily.
		enabled:
			enabled && !! sessionId && ! ( isReaderChatAgent( agentId ) && isFreshSession( agentId ) ),
		refetchOnWindowFocus: false,
	} );

	useEffect(
		() => {
			if ( data ) {
				onSuccessRef.current( data.messages, data.sessionId || sessionId );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to call onSuccess when data changes
		[ data ]
	);

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversation] Error loading conversation:', error );
		}
	}, [ error ] );

	return { data, isLoading, isError };
}

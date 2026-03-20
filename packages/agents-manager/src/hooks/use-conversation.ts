import {
	loadAllMessagesFromServer,
	createOdieBotId,
	isOdieBotId,
	type Message,
} from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';

interface Config {
	enabled?: boolean;
	maxPages?: number;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data: { messages: Message[]; sessionId?: string } | undefined;
	isLoading: boolean;
	isError: boolean;
}

export default function useConversation( {
	enabled = true,
	maxPages = 10,
	onSuccess = () => {},
}: Config ): Result {
	const { agentConfig } = useAgentsManagerContext();
	const { agentId, sessionId, authProvider } = agentConfig!;
	// Keep refs to the latest callbacks
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	const { data, isLoading, isError, error } = useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when sessionId changes
		queryKey: [ 'agents-manager-conversation', sessionId ],
		queryFn: async () => {
			const urlSearchParams = new URLSearchParams( window.location.search );
			const hasAgentParam = urlSearchParams.has( 'agent' );
			const botId = hasAgentParam || isOdieBotId( agentId ) ? agentId : createOdieBotId( agentId );

			try {
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
			} catch ( err ) {
				// A 404 means the conversation was deleted or expired on the server.
				// Warn and return empty so the chat can start fresh.
				if ( ( err as { statusCode?: number } ).statusCode === 404 ) {
					// eslint-disable-next-line no-console
					console.warn( '[useConversation] Conversation not found (expired or deleted).' );
					return { messages: [] as Message[], sessionId: undefined };
				}

				throw err;
			}
		},
		enabled: enabled && !! sessionId,
		// Keep history stable while browsing; use explicit non-default refetch behavior for chat UX.
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: 300000, // 5 minutes
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

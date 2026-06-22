import { loadAllMessagesFromServer, type Message } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from '@wordpress/element';
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

	// Capture whether the session was "fresh" (client-generated, never sent to the
	// server) AT MOUNT — not the live value. A session that started fresh in this
	// page load has nothing on the server to restore; and the flag is cleared after
	// the first message, so reading it live would flip `enabled` to true mid-stream
	// and reload the conversation right after the first reply. A session that was
	// already used before this load (not fresh at mount) is fetched once to restore.
	const [ wasFreshAtMount ] = useState( () => isFreshSession( agentId ) );

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
		// Public Reader Chat does not expose conversation history, and the
		// server-side history endpoint requires permissions public readers
		// usually do not have.
		//
		// Also skip a session that was brand-new ("fresh") AT MOUNT — generated
		// client-side and never sent to the server, so no chat row exists yet.
		// Fetching it would 404 and, once the flag clears after the first message,
		// reload the conversation mid-stream. Reloads of a real conversation (not
		// fresh at mount) still fetch and restore.
		enabled: enabled && !! sessionId && ! isReaderChatAgent( agentId ) && ! wasFreshAtMount,
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

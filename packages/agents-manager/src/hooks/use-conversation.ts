import { loadAllMessagesFromServer, type Message } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

interface Config {
	maxPages?: number;
	enabled?: boolean;
	/**
	 * Keep refetching while the loaded transcript ends on a user turn — the
	 * server has the question but is still answering (e.g. the page changed
	 * mid-reply). Polling stops once a reply lands or after `POLL_TIMEOUT_MS`.
	 */
	refetchWhileAwaitingReply?: boolean;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data: { messages: Message[]; sessionId?: string } | undefined;
	isLoading: boolean;
	isError: boolean;
	/** True while polling for a reply to a transcript-final user turn. */
	isAwaitingReply: boolean;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90_000;

function endsOnUserTurn( data?: { messages: Message[] } ): boolean {
	const last = data?.messages[ data.messages.length - 1 ];
	return last?.role === 'user';
}

/**
 * Fetches a conversation from the server when a `sessionId` is available.
 */
export default function useConversation( {
	maxPages = 10,
	enabled = true,
	refetchWhileAwaitingReply = false,
	onSuccess = () => {},
}: Config ): Result {
	const { agentConfig } = useAgentsManagerContext();
	const { agentId, sessionId, authProvider } = agentConfig!;

	// Keep a ref to the latest callback to avoid re-triggering effects when it changes.
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;
	const pollStartedAtRef = useRef< number | null >( null );

	const shouldPoll = ( current?: { messages: Message[] } ): boolean => {
		if ( ! refetchWhileAwaitingReply || ! endsOnUserTurn( current ) ) {
			pollStartedAtRef.current = null;
			return false;
		}
		pollStartedAtRef.current ??= Date.now();
		return Date.now() - pollStartedAtRef.current < POLL_TIMEOUT_MS;
	};

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
		enabled: enabled && !! sessionId && ! isReaderChatAgent( agentId ),
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) => ( shouldPoll( query.state.data ) ? POLL_INTERVAL_MS : false ),
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

	return { data, isLoading, isError, isAwaitingReply: shouldPoll( data ) };
}

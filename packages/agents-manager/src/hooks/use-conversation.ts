import {
	getUnresolvedMessages,
	loadAllMessagesFromServer,
	loadConversation,
	messageTextContent,
	type Message,
} from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

interface Config {
	maxPages?: number;
	enabled?: boolean;
	/**
	 * Keep refetching while a question is still unanswered on the server: the
	 * loaded transcript ends on a user turn, or a turn this tab sent (still
	 * `pending` in the local store) is not yet followed by a reply — the server
	 * persists a turn only once it starts processing it, so right after a page
	 * change it may be missing entirely. Stops once the reply lands or after
	 * `POLL_TIMEOUT_MS`.
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

/** Whether the transcript has an agent reply after the last user turn with `text`. */
function hasReplyTo( messages: Message[], text: string ): boolean {
	const index = messages.findLastIndex(
		( m ) => m.role === 'user' && messageTextContent( m ) === text
	);
	return index !== -1 && messages.slice( index + 1 ).some( ( m ) => m.role === 'agent' );
}

/** Text of user turns this tab sent that were still in flight when it last persisted. */
async function loadPendingTexts( sessionId: string ): Promise< string[] > {
	const { messages } = await loadConversation( sessionId );
	return getUnresolvedMessages( messages )
		.filter( ( m ) => m.role === 'user' )
		.map( messageTextContent );
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
	const [ pendingTexts, setPendingTexts ] = useState< string[] >( [] );

	useEffect( () => {
		if ( ! refetchWhileAwaitingReply || ! sessionId ) {
			return;
		}
		let cancelled = false;
		loadPendingTexts( sessionId )
			.then( ( texts ) => ! cancelled && setPendingTexts( texts ) )
			.catch( () => {} );
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- read the local store once per session
	}, [ sessionId ] );

	const shouldPoll = ( current?: { messages: Message[] } ): boolean => {
		const unanswered =
			endsOnUserTurn( current ) ||
			( !! current && pendingTexts.some( ( text ) => ! hasReplyTo( current.messages, text ) ) );
		if ( ! refetchWhileAwaitingReply || ! unanswered ) {
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

import {
	getAgentManager,
	loadAllMessagesFromServer,
	loadChatFromServer,
	type Message,
	type ServerLoadResult,
} from '@automattic/agenttic-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { isUnsentSession } from '../utils/agent-session';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import {
	getNewestServerId,
	getUnansweredQuestion,
	mergeNewestPage,
} from '../utils/unanswered-question';
import type { NoticeConfig } from '@automattic/agenttic-ui';

const REPLY_POLL_INTERVAL_MS = 3000;
// How long the conversation may stay unchanged, and how old a question may be,
// and still be waited on.
export const MAX_REPLY_WAIT_MS = 2 * 60_000;

type ReplyWait = 'idle' | 'waiting' | 'timed-out';

interface Config {
	maxPages?: number;
	enabled?: boolean;
	/** Whether an unanswered question may be waited on; false while a turn runs. */
	waitForReply?: boolean;
	onRetry?: ( question: string ) => void;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data: { messages: Message[]; sessionId?: string } | undefined;
	isLoading: boolean;
	isError: boolean;
	notice: NoticeConfig | undefined;
}

/**
 * Fetches a conversation from the server when a `sessionId` is available.
 *
 * After a page change mid-turn the conversation can load before its reply, so
 * it is reloaded until the reply lands, then offers Retry if none comes.
 */
export default function useConversation( {
	maxPages = 10,
	enabled = true,
	waitForReply = false,
	onRetry,
	onSuccess = () => {},
}: Config ): Result {
	const { agentConfig } = useAgentsManagerContext();
	const { agentId, sessionId, authProvider } = agentConfig!;

	// Keep a ref to the latest callback to avoid re-triggering effects when it changes.
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	// Unknown to the server until its first send. Read once per session, so that
	// send does not start a fetch that replaces the live stream.
	const isUnsent = useMemo( () => !! sessionId && isUnsentSession( sessionId ), [ sessionId ] );

	const [ replyWait, setReplyWait ] = useState< ReplyWait >( 'idle' );
	const replyWaitRef = useRef( replyWait );
	replyWaitRef.current = replyWait;
	const loadedNewestIdRef = useRef( 0 );

	const queryClient = useQueryClient();
	const queryKey = [ 'agents-manager-conversation', sessionId ];

	// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when sessionId changes
	const { data, isLoading, isError, error } = useQuery( {
		queryKey,
		queryFn: async () => {
			const urlSearchParams = new URLSearchParams( window.location.search );
			const hasAgentParam = urlSearchParams.has( 'agent' );
			const botId = getConversationBotId( agentId, hasAgentParam );
			const config = { botId, apiBaseUrl: API_BASE_URL, authProvider };

			// Only the newest page can change while a reply is awaited.
			const loaded = queryClient.getQueryData< ServerLoadResult >( queryKey );
			if ( replyWaitRef.current === 'waiting' && loaded ) {
				const newestPage = await loadChatFromServer( sessionId, config, 1, 50, true );
				return {
					...newestPage,
					messages: mergeNewestPage( loaded.messages, newestPage.messages ),
				};
			}

			return await loadAllMessagesFromServer( sessionId, config, maxPages, true );
		},
		// Public Reader Chat does not expose conversation history, and the
		// server-side history endpoint requires permissions public readers
		// usually do not have.
		enabled: enabled && !! sessionId && ! isUnsent && ! isReaderChatAgent( agentId ),
		refetchOnWindowFocus: false,
		refetchInterval: replyWait === 'waiting' ? REPLY_POLL_INTERVAL_MS : false,
		// The wait's cap keeps running in a background tab, so polling has to as well.
		refetchIntervalInBackground: true,
	} );

	const question = data && getUnansweredQuestion( data.messages );
	const newestId = data ? getNewestServerId( data.messages ) : 0;

	useEffect( () => {
		setReplyWait( 'idle' );
	}, [ sessionId ] );

	useEffect(
		() => {
			if ( ! waitForReply && replyWait === 'waiting' ) {
				setReplyWait( 'idle' );

				// A reload still in flight would land over the turn that just started.
				queryClient.cancelQueries( { queryKey, exact: true } );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only when the chat starts processing
		[ waitForReply ]
	);

	useEffect(
		() => {
			if ( ! data ) {
				return;
			}

			const isTurnInFlight = getAgentManager().isTurnInFlight( agentId );

			if ( replyWait === 'waiting' ) {
				// No new message: done once the reply is the newest one.
				if ( newestId === loadedNewestIdRef.current ) {
					if ( ! question ) {
						setReplyWait( 'idle' );
					}

					return;
				}

				// Loading now would replace the live stream.
				if ( ! waitForReply || isTurnInFlight ) {
					setReplyWait( 'idle' );

					return;
				}
			}

			loadedNewestIdRef.current = newestId;
			onSuccessRef.current( data.messages, data.sessionId || sessionId );

			if (
				waitForReply &&
				! isTurnInFlight &&
				question &&
				Date.now() - question.lastActivityAt < MAX_REPLY_WAIT_MS
			) {
				setReplyWait( 'waiting' );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to call onSuccess when data changes
		[ data ]
	);

	// Restarts with each new message: a long turn still adding results is not over.
	useEffect( () => {
		if ( replyWait !== 'waiting' ) {
			return;
		}

		const timer = setTimeout( () => setReplyWait( 'timed-out' ), MAX_REPLY_WAIT_MS );

		return () => clearTimeout( timer );
	}, [ replyWait, newestId ] );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversation] Error loading conversation:', error );
		}
	}, [ error ] );

	let notice: NoticeConfig | undefined;

	if ( replyWait === 'waiting' ) {
		notice = { message: __( 'Waiting for the reply…', __i18n_text_domain__ ), dismissible: false };
	} else if ( replyWait === 'timed-out' && question ) {
		notice = {
			message: __( 'No reply arrived for your last question.', __i18n_text_domain__ ),
			status: 'warning',
			// Retry resends text only, so a question with attachments is asked again by hand.
			...( question.text &&
				! question.hasFiles && {
					action: {
						label: __( 'Retry', __i18n_text_domain__ ),
						onClick: () => {
							setReplyWait( 'idle' );
							onRetry?.( question.text );
						},
					},
				} ),
			onDismiss: () => setReplyWait( 'idle' ),
		};
	}

	return { data, isLoading, isError, notice };
}

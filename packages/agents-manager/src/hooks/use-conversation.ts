import {
	getAgentManager,
	loadAllMessagesFromServer,
	loadChatFromServer,
	loadConversation,
	type Message,
	type PendingClientTools,
	type ServerLoadResult,
	type ToolResultInput,
	type TurnToolCall,
} from '@automattic/agenttic-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { isUnsentSession } from '../utils/agent-session';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import { buildToolCallResume } from '../utils/tool-call-resume';
import {
	getNewestServerId,
	getUnansweredQuestion,
	mergeNewestPage,
} from '../utils/unanswered-question';
import { getPendingNavigation } from '../utils/wp-admin-navigation-state';
import type { NoticeConfig } from '@automattic/agenttic-ui';

const REPLY_POLL_INTERVAL_MS = 3000;
// How long the conversation may stay unchanged, and how old a question may be,
// and still be waited on.
export const MAX_REPLY_WAIT_MS = 2 * 60_000;
// The page that ran a browser tool often still sends its result while this one
// loads, so a turn paused on one is resumed only after this long.
export const RESUME_AFTER_MS = 10_000;

type ReplyWait = 'idle' | 'waiting' | 'resuming' | 'timed-out';

interface Config {
	maxPages?: number;
	enabled?: boolean;
	/** Whether an unanswered question may be waited on; false while a turn runs. */
	waitForReply?: boolean;
	onRetry?: ( question: string ) => void;
	/** Answers a paused turn's browser tool calls; resolves to whether a reply arrived. */
	onResume?: ( results: ToolResultInput[], turnToolCalls: TurnToolCall[] ) => Promise< boolean >;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data:
		| { messages: Message[]; sessionId?: string; pendingClientTools?: PendingClientTools }
		| undefined;
	isLoading: boolean;
	isError: boolean;
	notice: NoticeConfig | undefined;
}

/**
 * Fetches a conversation from the server when a `sessionId` is available.
 *
 * After a page change mid-turn the conversation can load before its reply, so
 * it is reloaded until the reply lands, then offers Retry if none comes.
 *
 * A turn paused on a browser-run tool has no page left to send the result, so
 * after `RESUME_AFTER_MS` this page answers its calls with the result the old page
 * stored, or an "interrupted" one. The server takes one result per call, so a
 * resume that loses to another page just keeps waiting.
 */
export default function useConversation( {
	maxPages = 10,
	enabled = true,
	waitForReply = false,
	onRetry,
	onResume,
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
	// The tab's transcript as it was before hydration replaced it: the old page may
	// have stored a tool result it never got to send.
	const localMessagesRef = useRef< { sessionId: string; messages: Message[] } | undefined >(
		undefined
	);
	const resumeAttemptedRef = useRef( false );

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

			if ( localMessagesRef.current?.sessionId !== sessionId ) {
				const { messages } = await loadConversation( sessionId ).catch( () => ( {
					messages: [] as Message[],
				} ) );
				localMessagesRef.current = { sessionId, messages };
			}

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
		resumeAttemptedRef.current = false;
	}, [ sessionId ] );

	useEffect(
		() => {
			if ( waitForReply ) {
				return;
			}

			// A new turn answers the Retry notice too: its Retry would resend mid-turn.
			if ( replyWait === 'timed-out' ) {
				setReplyWait( 'idle' );
			}

			if ( replyWait === 'waiting' ) {
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
			// The resume streams its reply live; a reload would replace it.
			if ( ! data || replyWait === 'resuming' ) {
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

	const pendingTools = data?.pendingClientTools;
	const pendingToolsRef = useRef( pendingTools );
	pendingToolsRef.current = pendingTools;
	const canResume =
		replyWait === 'waiting' &&
		!! onResume &&
		pendingTools?.state === 'unanswered' &&
		! resumeAttemptedRef.current;

	useEffect(
		() => {
			if ( ! canResume ) {
				return;
			}

			const timer = setTimeout( async () => {
				const pending = pendingToolsRef.current;
				// A parked `wp-admin-navigate` is answered by `useNavigationContinuation`.
				const parkedNavigation = getPendingNavigation()?.toolCallId;
				if (
					pending?.state !== 'unanswered' ||
					pending.calls.some( ( call ) => call.toolCallId === parkedNavigation )
				) {
					return;
				}

				resumeAttemptedRef.current = true;
				setReplyWait( 'resuming' );
				const { results, turnToolCalls } = buildToolCallResume(
					pending,
					localMessagesRef.current?.messages ?? []
				);
				let replied = false;
				try {
					replied = ( await onResume?.( results, turnToolCalls ) ) ?? false;
				} catch {
					// Another page answered first, or the send failed: keep waiting for a reply.
				}
				setReplyWait( ( current ) => {
					if ( current !== 'resuming' ) {
						return current;
					}
					return replied ? 'idle' : 'waiting';
				} );
			}, RESUME_AFTER_MS );

			return () => clearTimeout( timer );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- the latest calls are read when it fires
		[ canResume ]
	);

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversation] Error loading conversation:', error );
		}
	}, [ error ] );

	let notice: NoticeConfig | undefined;

	if ( replyWait === 'waiting' ) {
		notice = { message: __( 'Waiting for the reply…', __i18n_text_domain__ ), dismissible: false };
	} else if ( replyWait === 'resuming' ) {
		notice = {
			message: __( 'Picking up your last question…', __i18n_text_domain__ ),
			dismissible: false,
		};
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

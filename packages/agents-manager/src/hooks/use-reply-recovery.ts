/**
 * Recover the reply to a question the merchant asked before a page change
 * (WOOAI-872): the new page hydrates the conversation once, and if the server
 * was still answering that fetch has the question and nothing after it.
 *
 * Nothing here rehydrates on a timer. The transcript is read once at mount
 * (the snapshot), then a cheap page-1 probe on its own query key watches for a
 * newer agent row. Only when the reply is confirmed is the hydration query
 * invalidated, once. Every path ends: the merchant sending or a turn going in
 * flight stops it, and a question the server never received (after
 * `LOST_AFTER_MS`) or never answers (after `UNANSWERED_AFTER_MS`) ends in a
 * notice with a retry.
 *
 * Every state is a notice, never `isProcessing`, so the composer stays usable.
 */
import {
	getAgentManager,
	getUnresolvedMessages,
	loadChatFromServer,
	loadConversation,
	messageTextContent,
	reconcileWithServer,
	type Message,
} from '@automattic/agenttic-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { getConversationBotId } from '../utils/conversation-bot-id';
import type { NoticeConfig } from '@automattic/agenttic-ui';

const PROBE_INTERVAL_MS = 3000;
// Both server paths persist a question before the model runs, so one missing
// this long after the page change never arrived.
export const LOST_AFTER_MS = 20_000;
// A turn paused on a browser-run tool stays paused once that page is gone, so
// waiting longer only delays the Retry.
export const UNANSWERED_AFTER_MS = 60_000;

type Phase = 'idle' | 'waiting' | 'lost' | 'unanswered';

interface Snapshot {
	/** Newest server id the first hydration held; a reply has a higher one. */
	newestServerId: number;
	/** User turns this tab sent that were still in flight when it last persisted. */
	pending: Message[];
	/**
	 * Full local transcript. Reconciliation counts copies of a prompt, so the
	 * pending slice alone hides a repeat.
	 */
	localMessages: Message[];
	/** The question being waited on, for the retry. */
	text: string;
}

interface Options {
	/** Messages from the first hydration; `undefined` until it lands. */
	hydratedMessages: Message[] | undefined;
	/** False for Reader Chat, once the merchant has sent, or while a turn runs. */
	enabled: boolean;
	/** Sends the prompt; resolves to whether it actually dispatched. */
	sendRetry: ( text: string ) => Promise< boolean >;
}

const serverIdOf = ( message: Message ): number => {
	const id = message.metadata?.serverId;
	return typeof id === 'number' ? id : 0;
};

const newestOf = ( messages: Message[] ): Message | undefined =>
	messages.reduce< Message | undefined >(
		( newest, message ) =>
			! newest || serverIdOf( message ) > serverIdOf( newest ) ? message : newest,
		undefined
	);

/** Pending turns `reconcileWithServer` finds missing from `serverMessages`. */
async function findMissingTurns(
	messages: Message[],
	serverMessages: Message[]
): Promise< Message[] > {
	const reconciled = await reconcileWithServer( messages, async () => serverMessages );
	return reconciled.filter( ( message ) => message.metadata?.deliveryStatus === 'failed' );
}

export default function useReplyRecovery( { hydratedMessages, enabled, sendRetry }: Options ): {
	notice: NoticeConfig | undefined;
} {
	const { agentConfig } = useAgentsManagerContext();
	const { agentId, sessionId, authProvider } = agentConfig!;
	const queryClient = useQueryClient();

	const [ phase, setPhase ] = useState< Phase >( 'idle' );
	const [ pending, setPending ] = useState< Message[] | null >( null );
	const snapshotRef = useRef< Snapshot | null >( null );
	const readStartedRef = useRef( false );
	const snapshotTakenRef = useRef( false );
	const isFirstProbeRef = useRef( true );
	const seenReplyIdRef = useRef< number | null >( null );
	const latestProbeRef = useRef< Message[] | null >( null );
	const localMessagesRef = useRef< Message[] >( [] );

	// Read the local store before hydration lands: hydrating replaces it.
	useEffect( () => {
		if ( ! enabled || ! sessionId || readStartedRef.current ) {
			return;
		}
		readStartedRef.current = true;
		loadConversation( sessionId )
			.then( ( { messages } ) => {
				localMessagesRef.current = messages;
				setPending(
					getUnresolvedMessages( messages ).filter( ( message ) => message.role === 'user' )
				);
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( '[useReplyRecovery] Error loading pending turns:', error );
				localMessagesRef.current = [];
				setPending( [] );
			} );
	}, [ enabled, sessionId ] );

	// Snapshot once, then wait only if a question is unanswered.
	useEffect( () => {
		if ( snapshotTakenRef.current || ! pending || ! hydratedMessages ) {
			return;
		}
		snapshotTakenRef.current = true;
		const lastMessage = hydratedMessages[ hydratedMessages.length - 1 ];
		const awaited =
			pending[ pending.length - 1 ] ?? ( lastMessage?.role === 'user' ? lastMessage : null );
		if ( ! enabled || ! awaited ) {
			return;
		}
		snapshotRef.current = {
			newestServerId: newestOf( hydratedMessages )
				? serverIdOf( newestOf( hydratedMessages )! )
				: 0,
			pending,
			localMessages: localMessagesRef.current,
			text: messageTextContent( awaited ),
		};
		setPhase( 'waiting' );
	}, [ enabled, hydratedMessages, pending ] );

	// The merchant took over, or a turn started: a probe must never race it.
	useEffect( () => {
		if ( ! enabled ) {
			setPhase( 'idle' );
		}
	}, [ enabled ] );

	const { data: probe, dataUpdatedAt } = useQuery( {
		queryKey: [ 'agents-manager-reply-probe', sessionId ],
		queryFn: async () => {
			const hasAgentParam = new URLSearchParams( window.location.search ).has( 'agent' );
			return await loadChatFromServer(
				sessionId,
				{
					botId: getConversationBotId( agentId, hasAgentParam ),
					apiBaseUrl: API_BASE_URL,
					authProvider,
				},
				1,
				50,
				false
			);
		},
		enabled: phase === 'waiting',
		refetchInterval: PROBE_INTERVAL_MS,
		// Keep waiting for the reply even if the merchant switches tabs meanwhile.
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		gcTime: 0,
	} );

	useEffect( () => {
		const snapshot = snapshotRef.current;
		if ( phase !== 'waiting' || ! probe || ! snapshot ) {
			return;
		}
		let cancelled = false;
		const isFirstProbe = isFirstProbeRef.current;
		isFirstProbeRef.current = false;
		latestProbeRef.current = probe.messages;

		const settle = () => {
			setPhase( 'idle' );
			// The tab may have started a turn since the probe; a hydration then
			// would replace a live stream.
			if ( ! getAgentManager().isTurnInFlight( agentId ) ) {
				queryClient.invalidateQueries( {
					queryKey: [ 'agents-manager-conversation', sessionId ],
					exact: true,
				} );
			}
		};

		( async () => {
			const newest = newestOf( probe.messages );
			if ( newest?.role !== 'agent' ) {
				seenReplyIdRef.current = null;
				return;
			}
			// Stop only when the newest agent row is already in the first hydration.
			// A higher id arrived after that fetch and still has to be confirmed.
			if ( isFirstProbe && snapshot.pending.length > 0 ) {
				const missing = await findMissingTurns( snapshot.localMessages, probe.messages );
				if ( cancelled || missing.length > 0 ) {
					return;
				}
				if ( serverIdOf( newest ) <= snapshot.newestServerId ) {
					setPhase( 'idle' );
					return;
				}
			}
			const replyId = serverIdOf( newest );
			if ( replyId <= snapshot.newestServerId ) {
				return;
			}
			// One more probe with the same newest reply: a tool turn can persist
			// an agent row before it is done.
			if ( seenReplyIdRef.current !== replyId ) {
				seenReplyIdRef.current = replyId;
				return;
			}
			if ( ! cancelled ) {
				settle();
			}
		} )();

		return () => {
			cancelled = true;
		};
		// Once per probe result; `probe` itself is a new object each fetch.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dataUpdatedAt ] );

	// Deadlines. Reconciliation decides "never arrived" (rather than a text
	// match here) so it follows the same rules as the first-message recovery.
	useEffect( () => {
		const snapshot = snapshotRef.current;
		if ( phase !== 'waiting' || ! snapshot ) {
			return;
		}
		let cancelled = false;

		const lostTimer = setTimeout( async () => {
			const serverMessages = latestProbeRef.current;
			// No probe ever succeeded: the server may still have the turn, so
			// leave it to the longer window instead of failing it.
			if ( snapshot.pending.length === 0 || ! serverMessages ) {
				return;
			}
			const missing = await findMissingTurns( snapshot.localMessages, serverMessages );
			if ( ! cancelled && missing.length > 0 ) {
				setPhase( 'lost' );
			}
		}, LOST_AFTER_MS );
		const unansweredTimer = setTimeout( () => setPhase( 'unanswered' ), UNANSWERED_AFTER_MS );

		return () => {
			cancelled = true;
			clearTimeout( lostTimer );
			clearTimeout( unansweredTimer );
		};
	}, [ phase ] );

	const retry = useCallback( async () => {
		const text = snapshotRef.current?.text;
		if ( ! text ) {
			return;
		}
		const previous = phase;
		setPhase( 'idle' );
		if ( ! ( await sendRetry( text ) ) ) {
			setPhase( previous );
		}
	}, [ phase, sendRetry ] );

	if ( phase === 'waiting' ) {
		return {
			notice: { message: __( 'Waiting for the reply…', __i18n_text_domain__ ), dismissible: false },
		};
	}
	if ( phase === 'lost' || phase === 'unanswered' ) {
		return {
			notice: {
				message:
					phase === 'lost'
						? __( "Your last question didn't reach the assistant.", __i18n_text_domain__ )
						: __( 'No reply arrived for your last question.', __i18n_text_domain__ ),
				status: 'warning',
				action: { label: __( 'Retry', __i18n_text_domain__ ), onClick: retry },
				onDismiss: () => setPhase( 'idle' ),
			},
		};
	}
	return { notice: undefined };
}

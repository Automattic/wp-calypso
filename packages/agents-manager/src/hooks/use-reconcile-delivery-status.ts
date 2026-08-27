/**
 * Reconcile an unresolved (in-flight) turn against the server on panel mount.
 *
 * When the page changes before a reply comes back, agenttic-client leaves the
 * user turn stored as `deliveryStatus: 'pending'` and the destination page
 * mounts with no session, orphaning it. This hook finds the orphan and asks the
 * server what happened: adopt its transcript, mark the turn `failed` so the UI
 * can offer a retry, or leave it pending when the fetch itself failed. The
 * resolution lives in `reconcileWithServer`; this is the discovery and wiring.
 */
import {
	clearConversation,
	getStoredSessionIds,
	getUnresolvedMessages,
	loadAllMessagesFromServer,
	loadConversation,
	messageTextContent,
	reconcileWithServer,
	type Message,
} from '@automattic/agenttic-client';
import { useEffect, useRef, useState } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { getConversationBotId } from '../utils/conversation-bot-id';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

export interface ReconcileResult {
	storageKey: string;
	/** `server`: the server had the turn (`storageKey` is its session id). `failed`: it never landed. */
	outcome: 'server' | 'failed';
	messages: Message[];
	/** Text of each user turn that ended up `failed`, for the retry affordance. */
	failedTexts: string[];
}

interface Result {
	isReconciling: boolean;
	/** `null` until reconciliation settles, and when there was nothing to do. */
	result: ReconcileResult | null;
}

const latestTimestamp = ( messages: Message[] ) =>
	Math.max( 0, ...messages.map( ( message ) => Number( message.metadata?.timestamp ) || 0 ) );

/**
 * Pick the newest stored conversation that still has an unresolved turn and
 * could belong to this agent. Stored entries carry no agent id, so a server
 * session is only a candidate when it is the one this agent is configured to
 * resume; `local-*` keys are always candidates since agenttic mints them for a
 * send that never received a session id.
 */
async function findUnresolvedConversation(
	sessionId?: string | null
): Promise< { storageKey: string; messages: Message[] } | null > {
	const keys = ( await getStoredSessionIds() ).filter(
		( key ) => key.startsWith( 'local-' ) || key === sessionId
	);
	const conversations = await Promise.all(
		keys.map( async ( storageKey ) => ( {
			storageKey,
			messages: ( await loadConversation( storageKey ) ).messages,
		} ) )
	);
	return (
		conversations
			.filter( ( { messages } ) => getUnresolvedMessages( messages ).length > 0 )
			.sort( ( a, b ) => latestTimestamp( b.messages ) - latestTimestamp( a.messages ) )[ 0 ] ??
		null
	);
}

export default function useReconcileDeliveryStatus(): Result {
	const { agentConfig } = useAgentsManagerContext();
	const [ isReconciling, setIsReconciling ] = useState( false );
	const [ result, setResult ] = useState< ReconcileResult | null >( null );

	// Reconcile once per mount, and never for Reader Chat (public frontends have
	// no server-side history to reconcile against).
	const hasRunRef = useRef( false );
	const agentId = agentConfig?.agentId;
	const authProvider = agentConfig?.authProvider;
	const sessionId = agentConfig?.sessionId;

	useEffect( () => {
		if ( hasRunRef.current || ! agentId || isReaderChatAgent( agentId ) ) {
			return;
		}
		hasRunRef.current = true;

		let cancelled = false;

		const run = async () => {
			const conversation = await findUnresolvedConversation( sessionId );
			if ( ! conversation || cancelled ) {
				return;
			}
			const { storageKey, messages } = conversation;
			let serverHadMessages = false;

			// A `local-*` key means the send was aborted before the server assigned
			// a session id, so there is nothing to fetch — resolve `null` and let
			// the primitive mark the turn `failed`.
			const fetchServer = storageKey.startsWith( 'local-' )
				? () => Promise.resolve< Message[] | null >( null )
				: async () => {
						const botId = getConversationBotId(
							agentId,
							new URLSearchParams( window.location.search ).has( 'agent' )
						);
						const serverResult = await loadAllMessagesFromServer(
							storageKey,
							{ botId, apiBaseUrl: API_BASE_URL, authProvider },
							10,
							true
						);
						serverHadMessages = serverResult.messages.length > 0;
						return serverResult.messages;
				  };

			setIsReconciling( true );
			try {
				const reconciled = await reconcileWithServer( messages, fetchServer );
				// Fetch threw (offline/500): the primitive returns the input
				// unchanged with the turn still unresolved. Leave storage intact so
				// a later mount can retry instead of guessing.
				if ( cancelled || getUnresolvedMessages( reconciled ).length > 0 ) {
					return;
				}

				const failedTexts = reconciled
					.filter( ( m ) => m.role === 'user' && m.metadata?.deliveryStatus === 'failed' )
					.map( messageTextContent );

				setResult( {
					storageKey,
					outcome: serverHadMessages ? 'server' : 'failed',
					messages: reconciled,
					failedTexts,
				} );

				// A `failed` turn is now surfaced in the panel with nothing left to
				// reconcile. Nothing re-persists that status until the next send, so
				// drop the stored entry to stop it re-firing on a later mount. When
				// the server had everything, the entry stays: the session continues
				// and its transcript is re-persisted normally.
				if ( failedTexts.length > 0 ) {
					await clearConversation( storageKey );
				}
			} finally {
				if ( ! cancelled ) {
					setIsReconciling( false );
				}
			}
		};
		void run();

		return () => {
			cancelled = true;
		};
	}, [ agentId, authProvider, sessionId ] );

	return { isReconciling, result };
}

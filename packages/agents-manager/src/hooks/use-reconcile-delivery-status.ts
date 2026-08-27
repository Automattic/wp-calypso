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
	getUnresolvedMessages,
	loadAllMessagesFromServer,
	reconcileWithServer,
	type Message,
} from '@automattic/agenttic-client';
import { useEffect, useRef, useState } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { getConversationBotId } from '../utils/conversation-bot-id';
import {
	clearStoredConversation,
	isLocalSessionKey,
	listStoredConversations,
	type LoadedConversation,
} from '../utils/conversation-storage-read';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

/** `server`: the server had the turn. `failed`: it never landed. */
export type ReconcileOutcome = 'server' | 'failed';

export interface ReconcileResult {
	storageKey: string;
	outcome: ReconcileOutcome;
	messages: Message[];
	/** Only set when `outcome === 'server'`. */
	serverSessionId: string | null;
	/** Text of each user turn that ended up `failed`, for the retry affordance. */
	failedTexts: string[];
}

interface Result {
	isReconciling: boolean;
	/** `null` until reconciliation settles, and when there was nothing to do. */
	result: ReconcileResult | null;
}

function messageText( message: Message ): string {
	return message.parts
		.filter( ( part ): part is { type: 'text'; text: string } => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( '\n' );
}

/**
 * Pick the newest stored conversation that still has an unresolved turn and
 * could belong to this agent. Stored entries carry no agent id, so a server
 * session is only a candidate when it is the one this agent is configured to
 * resume; `local-*` keys are always candidates since they were minted for a
 * send that never received a session id.
 * @param sessionId - the session id the agent is configured to resume, if any.
 */
function findUnresolvedConversation( sessionId?: string | null ): LoadedConversation | null {
	const candidates = listStoredConversations()
		.filter(
			( conversation ) =>
				isLocalSessionKey( conversation.storageKey ) || conversation.storageKey === sessionId
		)
		.filter( ( conversation ) => getUnresolvedMessages( conversation.messages ).length > 0 )
		.sort( ( a, b ) => b.lastUpdated - a.lastUpdated );

	return candidates[ 0 ] ?? null;
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

		const conversation = findUnresolvedConversation( sessionId );
		if ( ! conversation ) {
			// Nothing in flight — mark as run so we don't re-scan on every change.
			hasRunRef.current = true;
			return;
		}

		hasRunRef.current = true;
		const { storageKey, messages } = conversation;

		let cancelled = false;
		let serverHadMessages = false;

		// A `local-*` key means the send was aborted before the server assigned a
		// session id, so there is nothing to fetch — resolve `null` and let the
		// primitive mark the turn `failed`.
		const fetchServer = isLocalSessionKey( storageKey )
			? () => Promise.resolve< Message[] | null >( null )
			: async (): Promise< Message[] | null > => {
					const urlSearchParams = new URLSearchParams( window.location.search );
					const botId = getConversationBotId( agentId, urlSearchParams.has( 'agent' ) );
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

		reconcileWithServer( messages, fetchServer )
			.then( ( reconciled ) => {
				if ( cancelled ) {
					return;
				}

				// Fetch threw (offline/500): the primitive returns the input
				// unchanged with the turn still unresolved. Leave storage intact so
				// a later mount can retry instead of guessing.
				if ( getUnresolvedMessages( reconciled ).length > 0 ) {
					return;
				}

				const failedTexts = reconciled
					.filter(
						( message ) => message.role === 'user' && message.metadata?.deliveryStatus === 'failed'
					)
					.map( messageText );

				const outcome: ReconcileOutcome = serverHadMessages ? 'server' : 'failed';

				setResult( {
					storageKey,
					outcome,
					messages: reconciled,
					serverSessionId: outcome === 'server' ? storageKey : null,
					failedTexts,
				} );

				// A `failed` turn is now surfaced in the panel with nothing left to
				// reconcile. Nothing re-persists that status until the next send, so
				// drop the stored entry to stop it re-firing on a later mount. When
				// the server had everything, the entry stays: the session continues
				// and its transcript is re-persisted normally.
				if ( failedTexts.length > 0 ) {
					clearStoredConversation( storageKey );
				}
			} )
			.catch( ( error ) => {
				// `reconcileWithServer` swallows fetch errors, so reaching here is
				// unexpected. Leave storage intact and surface nothing.
				// eslint-disable-next-line no-console
				console.error( '[useReconcileDeliveryStatus] Reconciliation failed:', error );
			} )
			.finally( () => {
				if ( ! cancelled ) {
					setIsReconciling( false );
				}
			} );

		return () => {
			cancelled = true;
		};
	}, [ agentId, authProvider, sessionId ] );

	return { isReconciling, result };
}

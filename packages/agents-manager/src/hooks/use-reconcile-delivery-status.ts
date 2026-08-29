/**
 * Recover a first-message orphan on panel mount.
 *
 * The first send of a session is persisted under a client-minted `local-*`
 * key until the server assigns a session id. If the page changes before that
 * happens, the destination page mounts with no session and never loads the
 * turn: the merchant's question silently disappears. This hook finds such a
 * turn, marks it `failed`, and hands it to the panel so it can show the
 * question with a retry.
 *
 * Turns that already belong to a server session are not handled here —
 * `useConversation` reloads that transcript on mount.
 */
import {
	clearConversation,
	getStoredSessionIds,
	getUnresolvedMessages,
	loadConversation,
	messageTextContent,
	reconcileWithServer,
	type Message,
} from '@automattic/agenttic-client';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';

export interface ReconcileResult {
	storageKey: string;
	messages: Message[];
	/** Text of each user turn marked `failed`, for the retry affordance. */
	failedTexts: string[];
}

interface Result {
	isReconciling: boolean;
	/** `null` until reconciliation settles, and when there was nothing to do. */
	result: ReconcileResult | null;
}

const latestTimestamp = ( messages: Message[] ) =>
	Math.max( 0, ...messages.map( ( message ) => Number( message.metadata?.timestamp ) || 0 ) );

/** Newest `local-*` conversation that still has an unresolved turn. */
async function findOrphanedConversation(): Promise< {
	storageKey: string;
	messages: Message[];
} | null > {
	const keys = ( await getStoredSessionIds() ).filter( ( key ) => key.startsWith( 'local-' ) );
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

	// Once per mount, and never for Reader Chat (no history to recover into).
	const hasRunRef = useRef( false );
	const agentId = agentConfig?.agentId;

	useEffect( () => {
		if ( hasRunRef.current || ! agentId || isReaderChatAgent( agentId ) ) {
			return;
		}
		hasRunRef.current = true;

		let cancelled = false;

		const run = async () => {
			const conversation = await findOrphanedConversation();
			if ( ! conversation || cancelled ) {
				return;
			}
			const { storageKey, messages } = conversation;

			setIsReconciling( true );
			try {
				// A `local-*` key never received a session id, so there is nothing
				// to fetch: resolve `null` and let the primitive mark the turn failed.
				const reconciled = await reconcileWithServer( messages, () => Promise.resolve( null ) );
				if ( cancelled ) {
					return;
				}

				const failedTexts = reconciled
					.filter( ( m ) => m.role === 'user' && m.metadata?.deliveryStatus === 'failed' )
					.map( messageTextContent );

				setResult( { storageKey, messages: reconciled, failedTexts } );

				// The turn is now surfaced in the panel; drop the stored entry so it
				// does not re-fire on a later mount.
				await clearConversation( storageKey );
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
	}, [ agentId ] );

	return { isReconciling, result };
}

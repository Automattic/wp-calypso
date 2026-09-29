/**
 * Recover a first-message orphan on panel mount.
 *
 * The first send of a session is persisted under a client-minted `local-*`
 * key until the server assigns a session id. If the page changes before that,
 * no page ever loads the turn again. Surface it as a failed turn so the panel
 * can show the question with a retry instead of losing it silently.
 *
 * The recovered turn is handed back as a descriptor, not as conversation
 * history: it is presentational only. Loading it into the agent would persist
 * it under whatever session the panel currently holds and send it back with
 * the next turn's history, duplicating a conversation the merchant never
 * reopened. Retry re-sends the text as a fresh turn, so nothing downstream
 * needs the orphan in history.
 *
 * Turns that already belong to a server session are reloaded by
 * `useConversation`, not here.
 */
import {
	clearConversation,
	getAgentManager,
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

/** A user turn that never reached the server, for the retry affordance. */
export interface OrphanedTurn {
	/** Stable within a result: React key and retry identity. */
	id: string;
	text: string;
}

async function findOrphanedConversation(): Promise< {
	storageKey: string;
	messages: Message[];
} | null > {
	// An agent outlives the panel that shows it: closing the chat or stepping
	// through `/history` unmounts this hook while the first turn keeps
	// streaming, and that turn is still `pending` under its `local-*` key. Skip
	// anything a live agent holds. The manager is per page load, so a genuine
	// orphan never has one.
	const liveSessionIds = new Set( getAgentManager().getLiveSessionIds() );

	for ( const storageKey of ( await getStoredSessionIds() ).filter(
		( key ) => key.startsWith( 'local-' ) && ! liveSessionIds.has( key )
	) ) {
		const { messages } = await loadConversation( storageKey );
		if ( getUnresolvedMessages( messages ).length > 0 ) {
			return { storageKey, messages };
		}
	}
	return null;
}

/** `null` until reconciliation settles, and when there was nothing to recover. */
export default function useReconcileDeliveryStatus(): OrphanedTurn[] | null {
	const { agentConfig } = useAgentsManagerContext();
	const [ orphanedTurns, setOrphanedTurns ] = useState< OrphanedTurn[] | null >( null );

	// Once per mount, and never for Reader Chat (no history to recover into).
	const hasRunRef = useRef( false );
	const agentId = agentConfig?.agentId;

	useEffect( () => {
		if ( hasRunRef.current || ! agentId || isReaderChatAgent( agentId ) ) {
			return;
		}
		hasRunRef.current = true;
		let cancelled = false;

		findOrphanedConversation()
			.then( async ( conversation ) => {
				if ( ! conversation || cancelled ) {
					return;
				}
				// A `local-*` key never received a session id, so there is nothing to
				// fetch: resolve `null` and let the primitive mark the turn failed.
				const messages = await reconcileWithServer( conversation.messages, () =>
					Promise.resolve( null )
				);
				if ( cancelled ) {
					return;
				}
				setOrphanedTurns(
					messages
						.filter( ( m ) => m.role === 'user' && m.metadata?.deliveryStatus === 'failed' )
						.map( ( m ) => ( { id: m.messageId, text: messageTextContent( m ) } ) )
				);
				// Surfaced in the panel now; drop the stored entry so it does not re-fire.
				await clearConversation( conversation.storageKey );
			} )
			.catch( ( error ) => {
				// Leave the stored entry so the next mount can try again.
				hasRunRef.current = false;
				if ( cancelled ) {
					return;
				}
				// eslint-disable-next-line no-console
				console.error( '[useReconcileDeliveryStatus] Failed to recover orphaned turn:', error );
			} );

		return () => {
			cancelled = true;
		};
	}, [ agentId ] );

	return orphanedTurns;
}

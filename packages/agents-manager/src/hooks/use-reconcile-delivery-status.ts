/**
 * Recover a first-message orphan on panel mount.
 *
 * The first send of a session is persisted under a client-minted `local-*`
 * key until the server assigns a session id. If the page changes before that,
 * no page ever loads the turn again. Mark it `failed` and hand it to the panel
 * so the question is shown with a retry instead of silently disappearing.
 * Turns that already belong to a server session are reloaded by
 * `useConversation`, not here.
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
	messages: Message[];
	/** Text of each user turn marked `failed`, for the retry affordance. */
	failedTexts: string[];
}

async function findOrphanedConversation(): Promise< {
	storageKey: string;
	messages: Message[];
} | null > {
	for ( const storageKey of ( await getStoredSessionIds() ).filter( ( key ) =>
		key.startsWith( 'local-' )
	) ) {
		const { messages } = await loadConversation( storageKey );
		if ( getUnresolvedMessages( messages ).length > 0 ) {
			return { storageKey, messages };
		}
	}
	return null;
}

/** `null` until reconciliation settles, and when there was nothing to recover. */
export default function useReconcileDeliveryStatus(): ReconcileResult | null {
	const { agentConfig } = useAgentsManagerContext();
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
				setResult( {
					messages,
					failedTexts: messages
						.filter( ( m ) => m.role === 'user' && m.metadata?.deliveryStatus === 'failed' )
						.map( messageTextContent ),
				} );
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

	return result;
}

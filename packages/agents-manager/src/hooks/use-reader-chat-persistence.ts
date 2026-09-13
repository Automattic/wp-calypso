import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { AGENTS_MANAGER_STORE } from '../stores';
import { getAgentsManagerInlineData } from '../utils/get-agents-manager-inline-data';
import { usesLocalStatePersistence } from '../utils/uses-local-state-persistence';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Persists the chat open state across page navigations for client-persisted
 * hosts.
 *
 * Reader-chat and other client-persisted hosts (e.g. the logged-out storefront
 * shopper) run where `AGENTS_MANAGER_STORE` is in-memory only, so a fresh page
 * load resets `isOpen` to false. Mirror the flag in `sessionStorage` (per tab,
 * like the chat session). No-op for other agents, whose state is server-backed.
 */
export default function useReaderChatPersistence(): void {
	const { agentConfig } = useAgentsManagerContext();
	// The storefront's provider loads asynchronously, so the context agentId
	// lands after mount; the inline payload is on the page before that.
	const agentId = agentConfig?.agentId ?? getAgentsManagerInlineData()?.agentId ?? '';

	const persistsLocally = usesLocalStatePersistence( agentId );
	const storageKey = `jetpack-reader-chat-open-${ agentId }`;

	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const isOpen = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getIsOpen(),
		[]
	);

	const hasRestored = useRef( false );

	// Restore once, on the first render where the gate and the id are both known.
	useEffect( () => {
		if ( ! persistsLocally || ! agentId || hasRestored.current ) {
			return;
		}

		hasRestored.current = true;

		try {
			if ( sessionStorage.getItem( storageKey ) === '1' && ! isOpen ) {
				setIsOpen( true, false );
			}
		} catch {
			// ignore
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ persistsLocally, agentId, storageKey ] );

	// Write on every toggle, never before the restore: `isOpen` starts false and
	// would clear the flag the restore is about to read.
	useEffect( () => {
		if ( ! persistsLocally || ! agentId || ! hasRestored.current ) {
			return;
		}

		try {
			if ( isOpen ) {
				sessionStorage.setItem( storageKey, '1' );
			} else {
				sessionStorage.removeItem( storageKey );
			}
		} catch {
			// ignore
		}
	}, [ isOpen, persistsLocally, agentId, storageKey ] );
}

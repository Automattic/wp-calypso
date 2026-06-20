import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { AGENTS_MANAGER_STORE } from '../stores';
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
	// No-op until the agent config is ready; `usesLocalStatePersistence( '' )` is false.
	const agentId = agentConfig?.agentId ?? '';

	const persistsLocally = usesLocalStatePersistence( agentId );
	const storageKey = `jetpack-reader-chat-open-${ agentId }`;

	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const isOpen = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getIsOpen(),
		[]
	);

	// Restore on first mount.
	useEffect( () => {
		if ( ! persistsLocally ) {
			return;
		}

		try {
			if ( sessionStorage.getItem( storageKey ) === '1' && ! isOpen ) {
				setIsOpen( true, false );
			}
		} catch {
			// ignore
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Write on every toggle.
	useEffect( () => {
		if ( ! persistsLocally ) {
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
	}, [ isOpen, persistsLocally, storageKey ] );
}

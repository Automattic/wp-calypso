import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { AGENTS_MANAGER_STORE } from '../stores';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Persists the reader-chat open state across page navigations.
 *
 * Reader-chat runs on public blog frontends where `AGENTS_MANAGER_STORE` is
 * in-memory only, so a fresh page load resets `isOpen` to false. Mirror the
 * flag in `localStorage`: restore it on first mount and write it on every
 * toggle. No-op for other agents, whose state is server-backed.
 */
export default function useReaderChatPersistence( agentId: string ): void {
	const isReaderChat = isReaderChatAgent( agentId );
	const storageKey = `jetpack-reader-chat-open-${ agentId }`;
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const isOpen = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getIsOpen(),
		[]
	);

	// Restore on first mount.
	useEffect( () => {
		if ( ! isReaderChat ) {
			return;
		}
		try {
			if ( localStorage.getItem( storageKey ) === '1' && ! isOpen ) {
				setIsOpen( true, false );
			}
		} catch {
			// ignore
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Write on every toggle.
	useEffect( () => {
		if ( ! isReaderChat ) {
			return;
		}
		try {
			if ( isOpen ) {
				localStorage.setItem( storageKey, '1' );
			} else {
				localStorage.removeItem( storageKey );
			}
		} catch {
			// ignore
		}
	}, [ isOpen, isReaderChat, storageKey ] );
}

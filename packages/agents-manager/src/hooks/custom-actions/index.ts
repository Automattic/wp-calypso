import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
	setExternalContextCard,
	setExternalContextEntry,
} from '../../utils/external-context';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Publish actions onto `window.__agentsManagerActions`. Cleanup removes only
 * keys whose value is still ours, so callers can co-own the global. See
 * `README.md` for usage rules.
 */
export function useRegisterCustomActions( actions: Partial< AgentsManagerActions > ): void {
	// No deps array: re-sync every commit so the global stays correct even when
	// the set of keys changes (a computed deps array must keep a fixed length).
	useEffect( () => {
		const current = ( window.__agentsManagerActions ??= {} as AgentsManagerActions );
		Object.assign( current, actions );

		return () => {
			// Re-read the global rather than reusing `current`: a consumer may have
			// replaced it since we published, and we must clean up the live object.
			const latest = window.__agentsManagerActions;
			if ( ! latest ) {
				return;
			}
			( Object.keys( actions ) as ( keyof AgentsManagerActions )[] ).forEach( ( key ) => {
				if ( latest[ key ] === actions[ key ] ) {
					delete latest[ key ];
				}
			} );
		};
	} );
}

interface SetupProps {
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	canDock: boolean;
	setIsCompactMode: ( isCompact: boolean ) => void;
	setShouldRenderChat: ( shouldRender: boolean ) => void;
	setDesktopMediaQuery: ( query: string ) => void;
}

/**
 * Wire up the built-in actions on `window.__agentsManagerActions` and
 * dispatch `agents-manager-ready` once they're available. Mounted with
 * the agent dock.
 */
export function useSetupCustomActions( {
	dock,
	undock,
	openSidebar,
	closeSidebar,
	canDock,
	setIsCompactMode,
	setShouldRenderChat,
	setDesktopMediaQuery,
}: SetupProps ): void {
	const { hasLoaded, isOpen, isDocked, floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const { agentConfig, getActiveSessionId } = useAgentsManagerContext();
	const navigate = useNavigate();
	const resolveRef = useRef< ( ( state: AgentsManagerChatState ) => void ) | null >( null );
	const shouldPersistOpenState = ! isReaderChatAgent( agentConfig?.agentId );

	const setChatOpen = useCallback(
		( shouldOpen: boolean ) => {
			if ( typeof shouldOpen !== 'boolean' ) {
				return;
			}

			if ( ! isDocked || ! canDock ) {
				return setIsOpen( shouldOpen, shouldPersistOpenState );
			}

			if ( shouldOpen ) {
				openSidebar();
			}

			if ( ! shouldOpen ) {
				closeSidebar();
			}
		},
		[ canDock, closeSidebar, isDocked, openSidebar, setIsOpen, shouldPersistOpenState ]
	);

	const setChatDocked = useCallback(
		( shouldDock: boolean ) => {
			if ( typeof shouldDock !== 'boolean' ) {
				return;
			}

			if ( shouldDock ) {
				dock();
			} else {
				undock();
			}

			setIsDocked( shouldDock );
		},
		[ dock, setIsDocked, undock ]
	);

	const setChatCompactMode = useCallback(
		( isCompact: boolean ) => {
			if ( typeof isCompact !== 'boolean' ) {
				return;
			}

			setIsCompactMode( isCompact );
		},
		[ setIsCompactMode ]
	);

	const setChatEnabled = useCallback(
		( isEnabled: boolean ) => {
			if ( typeof isEnabled !== 'boolean' ) {
				return;
			}

			setShouldRenderChat( isEnabled );
		},
		[ setShouldRenderChat ]
	);

	const setChatDesktopMediaQuery = useCallback(
		( query: string ) => {
			if ( typeof query !== 'string' ) {
				return;
			}

			setDesktopMediaQuery( query );
		},
		[ setDesktopMediaQuery ]
	);

	const getChatState = useCallback( (): Promise< AgentsManagerChatState > => {
		if ( hasLoaded ) {
			return Promise.resolve( {
				isOpen: !! isOpen,
				isDocked: !! isDocked,
				floatingPosition: floatingPosition || '',
			} );
		}

		return new Promise( ( resolve ) => {
			resolveRef.current = resolve;
		} );
	}, [ hasLoaded, isOpen, isDocked, floatingPosition ] );

	// Resolve any pending `getChatState()` call once the store has loaded.
	useEffect( () => {
		if ( hasLoaded && resolveRef.current ) {
			resolveRef.current( {
				isOpen: !! isOpen,
				isDocked: !! isDocked,
				floatingPosition: floatingPosition || '',
			} );
			resolveRef.current = null;
		}
	}, [ hasLoaded, isOpen, isDocked, floatingPosition ] );

	useRegisterCustomActions( {
		getChatState,
		getSessionId: getActiveSessionId,
		setChatOpen,
		setChatDocked,
		setChatEnabled,
		setChatCompactMode,
		setChatDesktopMediaQuery,
		setContextEntry: setExternalContextEntry,
		removeContextEntry: removeExternalContextEntry,
		setContextCard: setExternalContextCard,
		removeContextCard: removeExternalContextCard,
		chatNavigate: navigate,
		isReady: true,
	} );

	// Hosts (e.g. CIAB) listen for `agents-manager-ready` to invoke actions without polling.
	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );
	}, [] );
}

import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

interface Props {
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	setIsCompactMode: ( isCompact: boolean ) => void;
	setShouldRenderChat: ( shouldRender: boolean ) => void;
}

export default function useSetupCustomActions( {
	dock,
	undock,
	openSidebar,
	closeSidebar,
	setIsCompactMode,
	setShouldRenderChat,
}: Props ) {
	const { hasLoaded, isOpen, isDocked, floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const navigate = useNavigate();
	const resolveRef = useRef< ( ( state: AgentsManagerChatState ) => void ) | null >( null );

	const setChatOpen = useCallback(
		( shouldOpen: boolean ) => {
			if ( typeof shouldOpen !== 'boolean' ) {
				return;
			}

			if ( isDocked && shouldOpen ) {
				openSidebar();
				return;
			}

			if ( isDocked && ! shouldOpen ) {
				closeSidebar();
				return;
			}

			setIsOpen( shouldOpen );
		},
		[ closeSidebar, isDocked, openSidebar, setIsOpen ]
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

	useEffect( () => {
		const state = {
			isOpen: !! isOpen,
			isDocked: !! isDocked,
			floatingPosition: floatingPosition || '',
		};

		// Resolve any pending `getChatState()` call with the latest state.
		if ( hasLoaded && resolveRef.current ) {
			resolveRef.current( state );
			resolveRef.current = null;
		}

		window.__agentsManagerActions = {
			// Declared inline to capture the fresh `state` from this effect.
			getChatState: () => {
				if ( hasLoaded ) {
					return Promise.resolve( state );
				}
				return new Promise( ( resolve ) => {
					resolveRef.current = resolve;
				} );
			},
			setChatOpen,
			setChatDocked,
			setChatEnabled,
			setChatCompactMode,
			chatNavigate: navigate,
		};

		return () => {
			delete window.__agentsManagerActions;
		};
	}, [
		hasLoaded,
		isOpen,
		isDocked,
		floatingPosition,
		setChatOpen,
		setChatDocked,
		setChatEnabled,
		setChatCompactMode,
		navigate,
	] );
}

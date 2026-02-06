import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

interface Props {
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
}

export default function useCustomEventHandler( {
	dock,
	undock,
	openSidebar,
	closeSidebar,
}: Props ) {
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const navigate = useNavigate();
	const { hasLoaded, isOpen, isDocked } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const handleNavigate = useCallback(
		( payload: { path: string; replace: boolean } ) => {
			const { path, replace } = payload || {};
			if ( typeof path !== 'string' || ! path.startsWith( '/' ) ) {
				return;
			}

			navigate( path, { replace: !! replace } );
		},
		[ navigate ]
	);

	const handleSetOpen = useCallback(
		( shouldOpen: unknown ) => {
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

	const handleSetDocked = useCallback(
		( shouldDock: unknown ) => {
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

	const handleGetState = useCallback( () => {
		// Dispatch a custom event with the current state
		const stateEvent = new CustomEvent( 'agents-manager:state', {
			detail: {
				hasLoaded,
				isOpen,
				isDocked,
			},
		} );
		window.dispatchEvent( stateEvent );
	}, [ hasLoaded, isOpen, isDocked ] );

	useEffect( () => {
		const handler = ( event: Event ) => {
			const { detail } = event as CustomEvent;

			if ( ! detail ) {
				return;
			}

			if ( detail.type === 'NAVIGATE' ) {
				handleNavigate( detail.payload );
			} else if ( detail.type === 'SET_CHAT_OPEN' ) {
				handleSetOpen( detail.payload );
			} else if ( detail.type === 'SET_CHAT_DOCKED' ) {
				handleSetDocked( detail.payload );
			} else if ( detail.type === 'GET_CHAT_STATE' ) {
				handleGetState();
			}
		};

		window.addEventListener( 'agents-manager:action', handler );
		return () => window.removeEventListener( 'agents-manager:action', handler );
	}, [ handleNavigate, handleSetDocked, handleSetOpen, handleGetState ] );
}

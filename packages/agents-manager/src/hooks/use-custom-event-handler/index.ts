import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { AGENTS_MANAGER_STORE } from '../../stores';

type Props = {
	isDocked: boolean;
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
};

export default function useCustomEventHandler( {
	isDocked,
	dock,
	undock,
	openSidebar,
	closeSidebar,
}: Props ) {
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const navigate = useNavigate();

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
			}
		};

		window.addEventListener( 'agents-manager:action', handler );
		return () => window.removeEventListener( 'agents-manager:action', handler );
	}, [ handleNavigate, handleSetDocked, handleSetOpen ] );
}

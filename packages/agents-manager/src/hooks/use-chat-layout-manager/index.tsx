import { AgentsManagerSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useCallback, useLayoutEffect, useRef, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AI } from '../../components/icons';
import { AGENTS_MANAGER_STORE } from '../../stores';
import './style.scss';

interface Options {
	sidebarContainer?: string | HTMLElement;
	desktopMediaQuery?: string;
	onOpenSidebar?: () => void;
	onCloseSidebar?: () => void;
	onDock?: () => void;
	onUndock?: () => void;
}

interface ReturnValue {
	isDocked: boolean;
	isDesktop: boolean;
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	createChatPortal: ( children: React.ReactNode ) => React.ReactNode | React.ReactPortal;
}

export default function useChatLayoutManager( {
	sidebarContainer = 'body',
	desktopMediaQuery = '(min-width: 1200px)',
	onOpenSidebar = () => {},
	onCloseSidebar = () => {},
	onDock = () => {},
	onUndock = () => {},
}: Options = {} ): ReturnValue {
	const { setIsDocked, setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { isDocked, isOpen } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const portalRef = useRef< HTMLDivElement >();
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const shouldRenderSidebar = isDesktop && isDocked;
	const openSidebarTimeoutRef = useRef< ReturnType< typeof setTimeout > >();

	// Store callback refs to avoid stale closures and prevent unnecessary re-renders
	const onDockRef = useRef( onDock );
	const onUndockRef = useRef( onUndock );
	const onOpenSidebarRef = useRef( onOpenSidebar );
	const onCloseSidebarRef = useRef( onCloseSidebar );
	onDockRef.current = onDock;
	onUndockRef.current = onUndock;
	onOpenSidebarRef.current = onOpenSidebar;
	onCloseSidebarRef.current = onCloseSidebar;

	const container = useMemo(
		() =>
			typeof sidebarContainer === 'string'
				? document.querySelector< HTMLElement >( sidebarContainer )
				: sidebarContainer,
		[ sidebarContainer ]
	);

	// Setup portal and handle dock / undock changes
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect( () => {
		if ( ! container ) {
			return;
		}

		// Create portal element if it doesn't exist
		if ( ! portalRef.current ) {
			portalRef.current = document.createElement( 'div' );
			portalRef.current.className = 'agents-manager-chat';
			container.appendChild( portalRef.current );
		}

		// Handle dock/undock state changes
		if ( shouldRenderSidebar ) {
			container.classList.add( 'agents-manager-sidebar-container' );
			portalRef.current.classList.add( 'agents-manager-chat--docked' );
			portalRef.current.classList.remove( 'agents-manager-chat--undocked' );

			if ( isOpen ) {
				container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );
			}

			onDockRef.current();
		} else {
			container.classList.remove(
				'agents-manager-sidebar-container',
				'agents-manager-sidebar-container--sidebar-open'
			);
			portalRef.current.classList.add( 'agents-manager-chat--undocked' );
			portalRef.current.classList.remove( 'agents-manager-chat--docked' );

			onUndockRef.current();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- defaultOpen should only apply on initial mount
	}, [ container, shouldRenderSidebar, isOpen ] );

	// Cleanup on unmount
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect(
		() => () => {
			clearTimeout( openSidebarTimeoutRef.current );

			if ( container ) {
				container.classList.remove(
					'agents-manager-sidebar-container',
					'agents-manager-sidebar-container--sidebar-open'
				);

				if ( portalRef.current ) {
					container.removeChild( portalRef.current );
					// Reset ref so a new portal is created on remount (e.g., StrictMode)
					portalRef.current = undefined;
				}
			}
		},
		[ container ]
	);

	const handleOpenSidebar = useCallback( () => {
		if ( ! container ) {
			return;
		}

		container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );

		setIsOpen( true );
		onOpenSidebarRef.current();
	}, [ container, setIsOpen ] );

	const handleCloseSidebar = useCallback( () => {
		if ( ! container ) {
			return;
		}

		container.classList.remove( 'agents-manager-sidebar-container--sidebar-open' );

		setIsOpen( false );
		onCloseSidebarRef.current();
	}, [ container, setIsOpen ] );

	const dock = useCallback( () => {
		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( true );

		if ( isDesktop ) {
			// Wait for DOM update to complete before opening the sidebar
			openSidebarTimeoutRef.current = setTimeout( handleOpenSidebar, 100 );
		}
	}, [ setIsDocked, isDesktop, handleOpenSidebar ] );

	const undock = useCallback( () => {
		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( false );
	}, [ setIsDocked ] );

	const createChatPortal = useCallback(
		( children: React.ReactNode ) => {
			if ( ! portalRef.current ) {
				return null;
			}

			return createPortal(
				shouldRenderSidebar ? (
					<>
						{ children }
						<Button
							className="agents-manager-sidebar-fab"
							icon={ AI }
							onClick={ handleOpenSidebar }
							label={ __( 'Open Chat', '__i18n_text_domain__' ) }
						/>
					</>
				) : (
					children
				),
				portalRef.current
			);
		},
		[ handleOpenSidebar, shouldRenderSidebar ]
	);

	return {
		isDocked: !! shouldRenderSidebar,
		isDesktop,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		createChatPortal,
	};
}

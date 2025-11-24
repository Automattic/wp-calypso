import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import {
	createPortal,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	useMemo,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AI } from '../../components/icons';
import './style.scss';

interface Options {
	defaultUndocked?: boolean;
	defaultOpen?: boolean;
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

export default function useChatLayoutManager(
	sidebarContainer: string | HTMLElement,
	{
		defaultUndocked = false,
		defaultOpen = false,
		desktopMediaQuery = '(min-width: 1200px)',
		onOpenSidebar = () => {},
		onCloseSidebar = () => {},
		onDock = () => {},
		onUndock = () => {},
	}: Options = {}
): ReturnValue {
	const portalRef = useRef< HTMLDivElement >();
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const [ isDocked, setIsDocked ] = useState( ! defaultUndocked );
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

			// Apply initial state
			if ( shouldRenderSidebar ) {
				container.classList.add( 'agents-manager-sidebar-container' );
				portalRef.current.classList.add( 'agents-manager-chat--docked' );

				if ( defaultOpen ) {
					container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );
				}

				onDockRef.current();
			} else {
				portalRef.current.classList.add( 'agents-manager-chat--undocked' );

				onUndockRef.current();
			}

			return;
		}

		// Handle state changes after initial setup
		if ( shouldRenderSidebar ) {
			container.classList.add( 'agents-manager-sidebar-container' );
			portalRef.current.classList.add( 'agents-manager-chat--docked' );
			portalRef.current.classList.remove( 'agents-manager-chat--undocked' );

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
	}, [ container, shouldRenderSidebar ] );

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

		onOpenSidebarRef.current();
	}, [ container ] );

	const handleCloseSidebar = useCallback( () => {
		if ( ! container ) {
			return;
		}

		container.classList.remove( 'agents-manager-sidebar-container--sidebar-open' );

		onCloseSidebarRef.current();
	}, [ container ] );

	const dock = useCallback( () => {
		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( true );

		if ( isDesktop ) {
			// Wait for DOM update to complete before opening the sidebar
			openSidebarTimeoutRef.current = setTimeout( handleOpenSidebar, 100 );
		}
	}, [ isDesktop, handleOpenSidebar ] );

	const undock = useCallback( () => {
		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( false );
	}, [] );

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
							label={ __( 'Open Chat', 'agents-manager' ) }
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
		isDocked: shouldRenderSidebar,
		isDesktop,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		createChatPortal,
	};
}

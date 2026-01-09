import { useWindowDimensions } from '@automattic/viewport';
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
	sidebarContainer?: string | HTMLElement;
	isReady?: boolean;
	defaultDocked?: boolean;
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
	createAgentPortal: ( children: React.ReactNode ) => React.ReactNode | React.ReactPortal;
}

export default function useAgentLayoutManager( {
	sidebarContainer = 'body',
	isReady = true,
	defaultDocked = true,
	defaultOpen = false,
	desktopMediaQuery = '(min-width: 1200px)',
	onOpenSidebar = () => {},
	onCloseSidebar = () => {},
	onDock = () => {},
	onUndock = () => {},
}: Options = {} ): ReturnValue {
	const portalRef = useRef< HTMLDivElement >();
	const [ isPortalReady, setIsPortalReady ] = useState( false );
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const { height } = useWindowDimensions();
	const [ isDocked, setIsDocked ] = useState< boolean | null >( null );
	const [ adminMenuHeight, setAdminMenuHeight ] = useState( 0 );

	const hasEnoughHeight = height >= adminMenuHeight;
	const shouldRenderSidebar = isDesktop && hasEnoughHeight && isDocked;
	const openSidebarTimeoutRef = useRef< ReturnType< typeof setTimeout > >();

	// Store default state refs to avoid stale closures and prevent unnecessary re-renders
	const defaultDockedRef = useRef( defaultDocked );
	const defaultOpenRef = useRef( defaultOpen );
	defaultDockedRef.current = defaultDocked;
	defaultOpenRef.current = defaultOpen;

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

	// Initialize docked state, setup portal element, and handle dock/undock changes
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect( () => {
		if ( ! isReady || ! container ) {
			return;
		}

		// Calculate admin menu height
		const adminMenu = document.getElementById( 'adminmenu' );
		if ( adminMenu ) {
			const menuHeight = adminMenu.offsetHeight;
			const menuTopOffset = adminMenu.getBoundingClientRect().top + window.scrollY;
			setAdminMenuHeight( menuHeight + menuTopOffset + 20 );
		}

		// Set initial docked state
		if ( isDocked === null ) {
			return setIsDocked( defaultDockedRef.current );
		}

		// Create portal element if it doesn't exist
		if ( ! portalRef.current ) {
			portalRef.current = document.createElement( 'div' );
			portalRef.current.className = 'agents-manager-chat';
			container.appendChild( portalRef.current );

			// Apply initial classes
			if ( shouldRenderSidebar ) {
				container.classList.add( 'agents-manager-sidebar-container' );
				portalRef.current.classList.add( 'agents-manager-chat--docked' );

				if ( defaultOpenRef.current ) {
					container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );
				}
			} else {
				portalRef.current.classList.add( 'agents-manager-chat--undocked' );
			}

			setIsPortalReady( true );

			return;
		}

		// Handle dock/undock state changes
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
	}, [ container, isDocked, isReady, shouldRenderSidebar ] );

	// Cleanup on unmount
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect(
		() => () => {
			clearTimeout( openSidebarTimeoutRef.current );
			setIsDocked( null );
			setIsPortalReady( false );

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
		if ( ! isReady || ! container ) {
			return;
		}

		container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );

		onOpenSidebarRef.current();
	}, [ container, isReady ] );

	const handleCloseSidebar = useCallback( () => {
		if ( ! isReady || ! container ) {
			return;
		}

		container.classList.remove( 'agents-manager-sidebar-container--sidebar-open' );

		onCloseSidebarRef.current();
	}, [ container, isReady ] );

	const dock = useCallback( () => {
		if ( ! isReady || ! container ) {
			return;
		}

		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( true );

		if ( isDesktop ) {
			// Wait for DOM update to complete before opening the sidebar
			openSidebarTimeoutRef.current = setTimeout( handleOpenSidebar, 100 );
		}
	}, [ container, isReady, handleOpenSidebar, isDesktop ] );

	const undock = useCallback( () => {
		if ( ! isReady || ! container ) {
			return;
		}

		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( false );
	}, [ container, isReady ] );

	const createAgentPortal = useCallback(
		( children: React.ReactNode ) => {
			if ( ! isPortalReady || ! portalRef.current ) {
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
		[ handleOpenSidebar, isPortalReady, shouldRenderSidebar ]
	);

	return {
		isDocked: !! shouldRenderSidebar,
		isDesktop,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		createAgentPortal,
	};
}

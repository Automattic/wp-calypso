import { useWindowDimensions } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import {
	createPortal,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useMemo,
	useSyncExternalStore,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AI } from '../../components/icons';
import observeEditorCanvasPointerDown from '../../utils/observe-editor-canvas-pointerdown';

const SIDEBAR_TRANSITION_DURATION_MS = 200;

// On Gutenberg editor screens, only dock when fullscreen mode is on —
// otherwise wp-admin's chrome leaves too little room for the editor.
const FULLSCREEN_GATED_BODY_CLASSES = [ 'post-php', 'post-new-php', 'site-editor-php' ];
const FULLSCREEN_BODY_CLASS = 'is-fullscreen-mode';

// The Jetpack pre-paint gate watches for this element to know the app has mounted,
// then hands off docking. Keep in sync with
// `jetpack/projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`.
const CHAT_PORTAL_CLASS = 'agents-manager-chat';

function getIsFullscreenGateOpen(): boolean {
	const { classList } = document.body;
	const isGated = FULLSCREEN_GATED_BODY_CLASSES.some( ( cls ) => classList.contains( cls ) );
	return ! isGated || classList.contains( FULLSCREEN_BODY_CLASS );
}

// Hoisted so the reference stays stable — otherwise `useSyncExternalStore`
// would tear down and re-create the observer on every render.
function subscribeToBodyClasses( notify: () => void ): () => void {
	const observer = new MutationObserver( notify );
	observer.observe( document.body, { attributes: true, attributeFilter: [ 'class' ] } );
	return () => observer.disconnect();
}

/**
 * Prevents docking the assistant when the user is browsing with certain conditions.
 *
 * IMPORTANT: Keep this logic in sync with
 * `jetpack/projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`.
 */
const useCanDock = ( { desktopMediaQuery }: { desktopMediaQuery: string } ) => {
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const { height } = useWindowDimensions();
	const [ adminMenuHeight, setAdminMenuHeight ] = useState( 0 );
	const hasEnoughHeight = height >= adminMenuHeight;
	const isFullscreenGateOpen = useSyncExternalStore(
		subscribeToBodyClasses,
		getIsFullscreenGateOpen
	);

	const calculateAdminMenuHeight = useCallback( () => {
		const adminMenu = document.getElementById( 'adminmenu' );
		if ( adminMenu ) {
			const adminBar = document.getElementById( 'wpadminbar' );
			const adminBarHeight = adminBar ? adminBar.offsetHeight : 32;
			setAdminMenuHeight( adminMenu.offsetHeight + adminBarHeight + 20 );
		}
	}, [] );

	return {
		canDock: isDesktop && hasEnoughHeight && isFullscreenGateOpen,
		calculateAdminMenuHeight,
	};
};

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
	/** Toggle the `is-split-screen` modifier on the sidebar container. */
	isSplitScreen?: boolean;
}

interface ReturnValue {
	isDocked: boolean;
	canDock: boolean;
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
	isSplitScreen = false,
}: Options = {} ): ReturnValue {
	const portalRef = useRef< HTMLDivElement | undefined >( undefined );
	const [ isPortalReady, setIsPortalReady ] = useState( false );
	const [ isDocked, setIsDocked ] = useState< boolean | null >( null );
	const { canDock, calculateAdminMenuHeight } = useCanDock( { desktopMediaQuery } );
	const shouldRenderSidebar = canDock && isDocked;
	const openSidebarTimeoutRef = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );
	const closeSidebarTimeoutRef = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );

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

		calculateAdminMenuHeight();

		// Set initial docked state
		if ( isDocked === null ) {
			return setIsDocked( defaultDockedRef.current );
		}

		// Create portal element if it doesn't exist
		if ( ! portalRef.current ) {
			portalRef.current = document.createElement( 'div' );
			portalRef.current.className = CHAT_PORTAL_CLASS;
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

			if ( defaultOpenRef.current ) {
				container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );
			}

			onDockRef.current();
		} else {
			// Cancel the sidebar-open `dock()` scheduled — its closure captured
			// `canDock` as true, so it would otherwise open the just-undocked sidebar.
			clearTimeout( openSidebarTimeoutRef.current );
			clearTimeout( closeSidebarTimeoutRef.current );
			container.classList.remove(
				'agents-manager-sidebar-container',
				'agents-manager-sidebar-container--sidebar-open',
				'agents-manager-sidebar-container--closing'
			);
			portalRef.current.classList.add( 'agents-manager-chat--undocked' );
			portalRef.current.classList.remove( 'agents-manager-chat--docked' );

			onUndockRef.current();
		}
	}, [ container, isDocked, isReady, shouldRenderSidebar ] );

	// Track focus on the chat panel so the floating chat can raise its z-index. `pointerdown` also
	// covers clicks on non-focusable regions (e.g. scroll areas) that skip `focusin`
	useEffect( () => {
		const node = portalRef.current;

		if ( ! isPortalReady || ! node || shouldRenderSidebar ) {
			node?.classList.remove( 'is-focused' );
			return;
		}

		const setFocused = () => {
			node.classList.add( 'is-focused' );
		};

		const handleFocusOut = ( e: FocusEvent ) => {
			if ( ! node.contains( e.relatedTarget as Node | null ) ) {
				node.classList.remove( 'is-focused' );
			}
		};

		const handleDocumentPointerDown = ( e: PointerEvent ) => {
			if ( ! node.contains( e.target as Node | null ) ) {
				node.classList.remove( 'is-focused' );
			}
		};

		node.addEventListener( 'focusin', setFocused );
		node.addEventListener( 'focusout', handleFocusOut );
		node.addEventListener( 'pointerdown', setFocused );
		document.addEventListener( 'pointerdown', handleDocumentPointerDown );
		const stopCanvasObserver = observeEditorCanvasPointerDown( handleDocumentPointerDown );

		return () => {
			node.removeEventListener( 'focusin', setFocused );
			node.removeEventListener( 'focusout', handleFocusOut );
			node.removeEventListener( 'pointerdown', setFocused );
			document.removeEventListener( 'pointerdown', handleDocumentPointerDown );
			stopCanvasObserver();
		};
	}, [ isPortalReady, shouldRenderSidebar ] );

	// Reflect split-screen state on the container as `is-split-screen`.
	useLayoutEffect( () => {
		if ( ! container ) {
			return;
		}
		container.classList.toggle( 'is-split-screen', !! isSplitScreen );
	}, [ container, isSplitScreen ] );

	// Cleanup on unmount
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect(
		() => () => {
			clearTimeout( openSidebarTimeoutRef.current );
			clearTimeout( closeSidebarTimeoutRef.current );
			setIsDocked( null );
			setIsPortalReady( false );

			if ( container ) {
				container.classList.remove(
					'agents-manager-sidebar-container',
					'agents-manager-sidebar-container--sidebar-open',
					'agents-manager-sidebar-container--closing',
					'is-split-screen'
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
		if ( ! isReady || ! container || ! canDock ) {
			return;
		}

		clearTimeout( closeSidebarTimeoutRef.current );
		container.classList.remove( 'agents-manager-sidebar-container--closing' );
		container.classList.add( 'agents-manager-sidebar-container--sidebar-open' );

		onOpenSidebarRef.current();
	}, [ canDock, container, isReady ] );

	const handleCloseSidebar = useCallback( () => {
		if ( ! isReady || ! container || ! canDock ) {
			return;
		}

		const wasSidebarOpen = container.classList.contains(
			'agents-manager-sidebar-container--sidebar-open'
		);

		container.classList.remove( 'agents-manager-sidebar-container--sidebar-open' );

		// Only suppress admin bar pointer events during an actual sidebar-close transition.
		if ( wasSidebarOpen ) {
			container.classList.add( 'agents-manager-sidebar-container--closing' );
			clearTimeout( closeSidebarTimeoutRef.current );
			closeSidebarTimeoutRef.current = setTimeout( () => {
				container?.classList.remove( 'agents-manager-sidebar-container--closing' );
			}, SIDEBAR_TRANSITION_DURATION_MS );
		}

		onCloseSidebarRef.current();
	}, [ canDock, container, isReady ] );

	const dock = useCallback( () => {
		if ( ! isReady || ! container ) {
			return;
		}

		clearTimeout( openSidebarTimeoutRef.current );
		setIsDocked( true );

		if ( canDock ) {
			// Wait for DOM update to complete before opening the sidebar
			openSidebarTimeoutRef.current = setTimeout( handleOpenSidebar, 100 );
		}
	}, [ container, isReady, handleOpenSidebar, canDock ] );

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
		canDock,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		createAgentPortal,
	};
}

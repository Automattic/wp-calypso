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
import { ResponsiveUndockContext } from './responsive-undock-context';

// On Gutenberg editor screens, only dock when fullscreen mode is on —
// otherwise wp-admin's chrome leaves too little room for the editor.
const FULLSCREEN_GATED_BODY_CLASSES = [ 'post-php', 'post-new-php', 'site-editor-php' ];
const FULLSCREEN_BODY_CLASS = 'is-fullscreen-mode';

// The Jetpack pre-paint gate watches for this element to know the app has mounted,
// then hands off docking. Keep in sync with
// `jetpack/projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`.
const CHAT_PORTAL_CLASS = 'agents-manager-chat';

// Container classes that reserve layout space for the docked sidebar.
const SIDEBAR_CONTAINER_CLASS = 'agents-manager-sidebar-container';
const SIDEBAR_OPEN_CLASS = 'agents-manager-sidebar-container--sidebar-open';

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
 * Whether the assistant can dock: requires a desktop viewport and, on Gutenberg
 * editor screens, fullscreen mode.
 *
 * IMPORTANT: Keep this logic in sync with
 * `jetpack/projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`.
 */
const useCanDock = ( { desktopMediaQuery }: { desktopMediaQuery: string } ) => {
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const isFullscreenGateOpen = useSyncExternalStore(
		subscribeToBodyClasses,
		getIsFullscreenGateOpen
	);

	return { canDock: isDesktop && isFullscreenGateOpen, isDesktop };
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
	/** `isResponsiveUndock` is true when the undock was forced by the viewport narrowing below `desktopMediaQuery`. */
	onUndock?: ( isResponsiveUndock: boolean ) => void;
	/** Toggle the `is-split-screen` modifier on the sidebar container. */
	isSplitScreen?: boolean;
}

interface ReturnValue {
	isDocked: boolean;
	isSidebarOpen: boolean;
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
	const { canDock, isDesktop } = useCanDock( { desktopMediaQuery } );
	const shouldRenderSidebar = canDock && isDocked;
	const isResponsiveUndocked = !! isDocked && ! isDesktop;
	const isDesktopRef = useRef( isDesktop );
	isDesktopRef.current = isDesktop;
	const openSidebarTimeoutRef = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );

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
	const [ isSidebarOpen, setIsSidebarOpen ] = useState(
		() => defaultOpen || container?.classList.contains( SIDEBAR_OPEN_CLASS ) || false
	);

	// Initialize docked state, setup portal element, and handle dock/undock changes
	// Use `useLayoutEffect` to prevent flickering
	useLayoutEffect( () => {
		if ( ! isReady || ! container ) {
			return;
		}

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
				container.classList.add( SIDEBAR_CONTAINER_CLASS );
				portalRef.current.classList.add( 'agents-manager-chat--docked' );
			} else {
				portalRef.current.classList.add( 'agents-manager-chat--undocked' );
			}

			setIsPortalReady( true );

			return;
		}

		// Handle dock/undock state changes
		if ( shouldRenderSidebar ) {
			container.classList.add( SIDEBAR_CONTAINER_CLASS );
			portalRef.current.classList.add( 'agents-manager-chat--docked' );
			portalRef.current.classList.remove( 'agents-manager-chat--undocked' );

			if ( defaultOpenRef.current ) {
				setIsSidebarOpen( true );
			}

			onDockRef.current();
		} else {
			// Cancel the sidebar-open `dock()` scheduled — its closure captured
			// `canDock` as true, so it would otherwise open the just-undocked sidebar.
			clearTimeout( openSidebarTimeoutRef.current );
			container.classList.remove( SIDEBAR_CONTAINER_CLASS, SIDEBAR_OPEN_CLASS );
			portalRef.current.classList.add( 'agents-manager-chat--undocked' );
			portalRef.current.classList.remove( 'agents-manager-chat--docked' );
			setIsSidebarOpen( false );

			// Docked preference still on + non-desktop viewport = responsive undock.
			onUndockRef.current( !! isDocked && ! isDesktopRef.current );
		}
	}, [ container, isDocked, isReady, shouldRenderSidebar ] );

	useLayoutEffect( () => {
		container?.classList.toggle( SIDEBAR_OPEN_CLASS, !! shouldRenderSidebar && isSidebarOpen );
	}, [ container, isSidebarOpen, shouldRenderSidebar ] );

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
			setIsDocked( null );
			setIsPortalReady( false );

			if ( container ) {
				container.classList.remove(
					SIDEBAR_CONTAINER_CLASS,
					SIDEBAR_OPEN_CLASS,
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

		setIsSidebarOpen( true );

		onOpenSidebarRef.current();
	}, [ canDock, container, isReady ] );

	const handleCloseSidebar = useCallback( () => {
		if ( ! isReady || ! container || ! canDock ) {
			return;
		}

		setIsSidebarOpen( false );
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
				<ResponsiveUndockContext.Provider value={ isResponsiveUndocked }>
					{ shouldRenderSidebar ? (
						<>
							{ children }
							<Button
								className="agents-manager-sidebar-fab"
								icon={ AI }
								onClick={ handleOpenSidebar }
								label={ __( 'Open Chat', __i18n_text_domain__ ) }
							/>
						</>
					) : (
						children
					) }
				</ResponsiveUndockContext.Provider>,
				portalRef.current
			);
		},
		[ handleOpenSidebar, isResponsiveUndocked, isPortalReady, shouldRenderSidebar ]
	);

	return {
		isDocked: !! shouldRenderSidebar,
		isSidebarOpen: !! shouldRenderSidebar && isSidebarOpen,
		canDock,
		dock,
		undock,
		openSidebar: handleOpenSidebar,
		closeSidebar: handleCloseSidebar,
		createAgentPortal,
	};
}

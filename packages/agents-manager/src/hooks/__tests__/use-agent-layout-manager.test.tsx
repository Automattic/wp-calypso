/**
 * @jest-environment jsdom
 */
import { renderHook, act, render as renderComponent, screen } from '@testing-library/react';
import useAgentLayoutManager from '../use-agent-layout-manager/index';
import { useResponsiveUndock } from '../use-agent-layout-manager/responsive-undock-context';

// Stub out viewport/responsive deps so `canDock` depends only on the hook's
// own logic (viewport defaults to desktop).
let mockIsDesktop = true;
jest.mock( '@wordpress/compose', () => ( {
	useMediaQuery: () => mockIsDesktop,
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: () => null,
} ) );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	createPortal: ( children: React.ReactNode ) => children,
} ) );

const OPEN_CLASS = 'agents-manager-sidebar-container--sidebar-open';
const SPLIT_SCREEN_CLASS = 'is-split-screen';
const DOCK_OPEN_DELAY_MS = 100;

const FULLSCREEN_BODY_CLASS = 'is-fullscreen-mode';
const EDITOR_BODY_CLASSES = [ 'post-php', 'post-new-php', 'site-editor-php' ] as const;

type Options = NonNullable< Parameters< typeof useAgentLayoutManager >[ 0 ] >;

let container: HTMLElement;

// Render the hook against the shared `container`. Defaults to a docked-open
// sidebar (the common case); pass overrides here or to the returned `rerender`.
function render( options: Options = {} ) {
	return renderHook(
		( props: Options ) =>
			useAgentLayoutManager( {
				sidebarContainer: container,
				defaultDocked: true,
				defaultOpen: true,
				...props,
			} ),
		{ initialProps: options }
	);
}

// Toggle a body class and flush the `MutationObserver` microtask so the
// resulting `useSyncExternalStore` re-render settles inside `act()`.
async function setBodyClass( className: string, on: boolean ) {
	await act( async () => {
		document.body.classList.toggle( className, on );
		await Promise.resolve();
	} );
}

beforeEach( () => {
	// Reset before each test (not after) so RTL's auto-cleanup disconnects the
	// observer first — otherwise this body mutation re-renders outside `act()`.
	document.body.className = '';
	mockIsDesktop = true;
	container = document.createElement( 'div' );
	document.body.appendChild( container );
} );

afterEach( () => {
	container.remove();
} );

describe( 'useAgentLayoutManager — docking gate', () => {
	it( 'allows docking on non-editor screens (no gated body class)', () => {
		expect( render().result.current.canDock ).toBe( true );
	} );

	it.each( EDITOR_BODY_CLASSES )( 'blocks docking on `%s` when fullscreen mode is off', ( cls ) => {
		document.body.classList.add( cls );
		expect( render().result.current.canDock ).toBe( false );
	} );

	it.each( EDITOR_BODY_CLASSES )( 'allows docking on `%s` when fullscreen mode is on', ( cls ) => {
		document.body.classList.add( cls, FULLSCREEN_BODY_CLASS );
		expect( render().result.current.canDock ).toBe( true );
	} );

	it( 'reacts to runtime fullscreen-mode toggles', async () => {
		document.body.classList.add( 'post-php' );
		const { result } = render();
		expect( result.current.canDock ).toBe( false );

		await setBodyClass( FULLSCREEN_BODY_CLASS, true );
		expect( result.current.canDock ).toBe( true );

		await setBodyClass( FULLSCREEN_BODY_CLASS, false );
		expect( result.current.canDock ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — open / close', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	it( 'toggles the sidebar-open class via open/close', () => {
		const { result } = render();
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( true );
		expect( result.current.isSidebarOpen ).toBe( true );

		act( () => result.current.closeSidebar() );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( false );
		expect( result.current.isSidebarOpen ).toBe( false );

		act( () => result.current.openSidebar() );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( true );
		expect( result.current.isSidebarOpen ).toBe( true );
	} );

	it( 'cancels the pending dock-open when the layout undocks before it fires', async () => {
		document.body.classList.add( 'post-php', FULLSCREEN_BODY_CLASS );
		const onOpenSidebar = jest.fn();
		const { result } = render( { defaultDocked: false, defaultOpen: false, onOpenSidebar } );

		// dock() schedules the open ~100ms later (its captured `canDock` is true).
		act( () => result.current.dock() );

		// Dockability is lost via the layout path — not undock() — before it fires.
		await setBodyClass( FULLSCREEN_BODY_CLASS, false );

		act( () => jest.advanceTimersByTime( DOCK_OPEN_DELAY_MS ) );
		expect( onOpenSidebar ).not.toHaveBeenCalled();
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — open-state sync on dock transition', () => {
	it( 'opens the docked sidebar when the shared open state is true as it becomes dockable', async () => {
		// Editor screen without fullscreen → not dockable yet (floating).
		document.body.classList.add( 'post-php' );
		const { result, rerender } = render( { defaultOpen: false } );
		expect( result.current.isDocked ).toBe( false );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( false );

		// The floating chat is opened — the shared open state flips to true.
		rerender( { defaultOpen: true } );

		await setBodyClass( FULLSCREEN_BODY_CLASS, true );
		expect( result.current.isDocked ).toBe( true );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( true );
		expect( result.current.isSidebarOpen ).toBe( true );
	} );

	it( 'keeps the docked sidebar closed when the shared open state is false as it becomes dockable', async () => {
		document.body.classList.add( 'post-php' );
		const { result } = render( { defaultOpen: false } );
		expect( result.current.isDocked ).toBe( false );

		await setBodyClass( FULLSCREEN_BODY_CLASS, true );
		expect( result.current.isDocked ).toBe( true );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( false );
		expect( result.current.isSidebarOpen ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — lifecycle callbacks', () => {
	it( 'fires onDock when the layout docks and onUndock when it undocks', async () => {
		document.body.classList.add( 'post-php' ); // not dockable yet
		const onDock = jest.fn();
		const onUndock = jest.fn();
		render( { onDock, onUndock } );

		await setBodyClass( FULLSCREEN_BODY_CLASS, true );
		expect( onDock ).toHaveBeenCalledTimes( 1 );
		expect( onUndock ).not.toHaveBeenCalled();

		await setBodyClass( FULLSCREEN_BODY_CLASS, false );
		expect( onUndock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'fires onOpenSidebar and onCloseSidebar when the docked sidebar is toggled', () => {
		const onOpenSidebar = jest.fn();
		const onCloseSidebar = jest.fn();
		const { result } = render( { onOpenSidebar, onCloseSidebar } );

		act( () => result.current.closeSidebar() );
		expect( onCloseSidebar ).toHaveBeenCalledTimes( 1 );

		act( () => result.current.openSidebar() );
		expect( onOpenSidebar ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'useAgentLayoutManager — split-screen class', () => {
	it( 'adds the class when `isSplitScreen` flips from `false` to `true`', () => {
		const { rerender } = render( { isSplitScreen: false } );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );

		rerender( { isSplitScreen: true } );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );
	} );

	it( 'removes the class when `isSplitScreen` flips from `true` to `false`', () => {
		const { rerender } = render( { isSplitScreen: true } );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );

		rerender( { isSplitScreen: false } );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );
	} );

	it( 'removes the class on unmount', () => {
		const { unmount } = render( { isSplitScreen: true } );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );

		act( () => unmount() );
		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — responsive undock', () => {
	it( 'provides the flag and a per-undock counter to portal children', () => {
		function Probe() {
			const { isResponsiveUndocked, undockCount } = useResponsiveUndock();
			return <span data-testid="flag">{ `${ isResponsiveUndocked }-${ undockCount }` }</span>;
		}
		function Host() {
			const { createAgentPortal } = useAgentLayoutManager( { sidebarContainer: container } );
			return <>{ createAgentPortal( <Probe /> ) }</>;
		}

		const view = renderComponent( <Host /> );
		expect( screen.getByTestId( 'flag' ).textContent ).toBe( 'false-0' );

		mockIsDesktop = false;
		view.rerender( <Host /> );
		expect( screen.getByTestId( 'flag' ).textContent ).toBe( 'true-1' );

		mockIsDesktop = true;
		view.rerender( <Host /> );
		expect( screen.getByTestId( 'flag' ).textContent ).toBe( 'false-1' );

		// The next responsive undock bumps the counter again.
		mockIsDesktop = false;
		view.rerender( <Host /> );
		expect( screen.getByTestId( 'flag' ).textContent ).toBe( 'true-2' );
	} );

	it( 'flags only the undock forced by the desktop media query', async () => {
		const onUndock = jest.fn();
		const { result, rerender } = render( { onUndock } );

		// Viewport narrows below the desktop query while docked.
		mockIsDesktop = false;
		rerender( { onUndock } );
		expect( onUndock ).toHaveBeenLastCalledWith( true );

		// Re-dock, then close the fullscreen gate: not a viewport switch.
		mockIsDesktop = true;
		rerender( { onUndock } );
		await setBodyClass( EDITOR_BODY_CLASSES[ 0 ], true );
		expect( onUndock ).toHaveBeenLastCalledWith( false );
		await setBodyClass( EDITOR_BODY_CLASSES[ 0 ], false );

		// A manual undock is not a viewport switch.
		act( () => result.current.undock() );
		expect( onUndock ).toHaveBeenLastCalledWith( false );
	} );
} );

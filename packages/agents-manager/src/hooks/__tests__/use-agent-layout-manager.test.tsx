/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useAgentLayoutManager from '../use-agent-layout-manager/index';

// Stub out viewport/responsive deps so `canDock` depends only on the hook's
// own logic (viewport is always desktop, window is always tall enough).
jest.mock( '@automattic/viewport', () => ( {
	useWindowDimensions: () => ( { width: 1920, height: 1080 } ),
} ) );
jest.mock( '@wordpress/compose', () => ( {
	useMediaQuery: () => true,
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: () => null,
} ) );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	createPortal: ( children: React.ReactNode ) => children,
} ) );

const CLOSING_CLASS = 'agents-manager-sidebar-container--closing';
const OPEN_CLASS = 'agents-manager-sidebar-container--sidebar-open';
const SPLIT_SCREEN_CLASS = 'is-split-screen';
const TRANSITION_MS = 200;

const FULLSCREEN_BODY_CLASS = 'is-fullscreen-mode';
const EDITOR_BODY_CLASSES = [ 'post-php', 'post-new-php', 'site-editor-php' ] as const;

function renderLayoutManager( container: HTMLElement ) {
	return renderHook( () =>
		useAgentLayoutManager( {
			sidebarContainer: container,
			defaultDocked: true,
			defaultOpen: true,
		} )
	);
}

describe( 'useAgentLayoutManager — closing class suppression', () => {
	let container: HTMLElement;

	beforeEach( () => {
		jest.useFakeTimers();
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		container.remove();
	} );

	it( 'adds --closing class when closeSidebar() is called while sidebar is open', () => {
		const { result } = renderLayoutManager( container );

		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( true );
	} );

	it( 'does not add --closing class when sidebar was already closed', () => {
		const { result } = renderLayoutManager( container );

		// Close once to get to closed state
		act( () => {
			result.current.closeSidebar();
		} );
		act( () => {
			jest.runAllTimers();
		} );

		// Close again from already-closed state
		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
	} );

	it( 'removes --closing class after the transition timeout', () => {
		const { result } = renderLayoutManager( container );

		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( true );

		act( () => {
			jest.advanceTimersByTime( TRANSITION_MS );
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
	} );

	it( 'clears the timeout and removes --closing class when openSidebar() is called during transition', () => {
		const { result } = renderLayoutManager( container );

		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( true );

		// Re-open before timeout fires
		act( () => {
			result.current.openSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
		expect( container.classList.contains( OPEN_CLASS ) ).toBe( true );

		// Advance past where the timeout would have fired — class should still be absent
		act( () => {
			jest.advanceTimersByTime( TRANSITION_MS );
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
	} );

	it( 'removes --closing class and cancels the timeout when undocking during a close transition', () => {
		const { result } = renderLayoutManager( container );

		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( true );

		act( () => {
			result.current.undock();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );

		// Advance past where the timeout would have fired — class should still be absent
		act( () => {
			jest.advanceTimersByTime( TRANSITION_MS );
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
	} );

	it( 'removes --closing class on unmount', () => {
		const { result, unmount } = renderLayoutManager( container );

		act( () => {
			result.current.closeSidebar();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( true );

		act( () => {
			unmount();
		} );

		expect( container.classList.contains( CLOSING_CLASS ) ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — fullscreen gate', () => {
	let container: HTMLElement;

	beforeEach( () => {
		// Reset in `beforeEach` (not `afterEach`) so RTL's auto-cleanup
		// disconnects the observer first — otherwise the next test's
		// `body` mutation triggers a re-render outside `act()`.
		document.body.className = '';
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		container.remove();
	} );

	it( 'allows docking on non-editor screens (no gated body class)', () => {
		const { result } = renderLayoutManager( container );
		expect( result.current.canDock ).toBe( true );
	} );

	it.each( EDITOR_BODY_CLASSES )(
		'blocks docking on `%s` when fullscreen mode is off',
		( editorClass ) => {
			document.body.classList.add( editorClass );
			const { result } = renderLayoutManager( container );
			expect( result.current.canDock ).toBe( false );
		}
	);

	it.each( EDITOR_BODY_CLASSES )(
		'allows docking on `%s` when fullscreen mode is on',
		( editorClass ) => {
			document.body.classList.add( editorClass, FULLSCREEN_BODY_CLASS );
			const { result } = renderLayoutManager( container );
			expect( result.current.canDock ).toBe( true );
		}
	);

	it( 'reacts to runtime fullscreen-mode toggles', async () => {
		document.body.classList.add( 'post-php' );
		const { result } = renderLayoutManager( container );

		expect( result.current.canDock ).toBe( false );

		// `MutationObserver` callbacks fire on a microtask — flush one tick
		// inside `act()` so the resulting re-render lands within it.
		await act( async () => {
			document.body.classList.add( FULLSCREEN_BODY_CLASS );
			await Promise.resolve();
		} );
		expect( result.current.canDock ).toBe( true );

		await act( async () => {
			document.body.classList.remove( FULLSCREEN_BODY_CLASS );
			await Promise.resolve();
		} );
		expect( result.current.canDock ).toBe( false );
	} );
} );

describe( 'useAgentLayoutManager — split-screen class', () => {
	let container: HTMLElement;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		container.remove();
	} );

	function renderWithSplitScreen( isSplitScreen: boolean ) {
		return renderHook(
			( props: { isSplitScreen: boolean } ) =>
				useAgentLayoutManager( {
					sidebarContainer: container,
					defaultDocked: true,
					defaultOpen: true,
					isSplitScreen: props.isSplitScreen,
				} ),
			{ initialProps: { isSplitScreen } }
		);
	}

	it( 'adds the class when `isSplitScreen` flips from `false` to `true`', () => {
		const { rerender } = renderWithSplitScreen( false );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );

		rerender( { isSplitScreen: true } );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );
	} );

	it( 'removes the class when `isSplitScreen` flips from `true` to `false`', () => {
		const { rerender } = renderWithSplitScreen( true );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );

		rerender( { isSplitScreen: false } );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );
	} );

	it( 'removes the class on unmount', () => {
		const { unmount } = renderWithSplitScreen( true );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( true );

		act( () => {
			unmount();
		} );

		expect( container.classList.contains( SPLIT_SCREEN_CLASS ) ).toBe( false );
	} );
} );

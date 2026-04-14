/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useAgentLayoutManager from '../use-agent-layout-manager/index';

// Stub out external deps that aren't relevant to the closing-class logic
jest.mock( '@automattic/viewport', () => ( {
	useWindowDimensions: () => ( { width: 1920, height: 1080 } ),
} ) );
jest.mock( '@wordpress/compose', () => ( {
	useMediaQuery: () => true, // always "desktop" so canDock is true
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
const TRANSITION_MS = 200;

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

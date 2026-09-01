/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSmallViewportDefaultClosed } from '../use-small-viewport-default-closed';

const mockSetIsOpen = jest.fn();
let mockState: { hasLoaded: boolean; isOpen: boolean };

jest.mock( '../../stores', () => ( {
	AGENTS_MANAGER_STORE: 'automattic/agents-manager',
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setIsOpen: mockSetIsOpen } ),
	useSelect: () => mockState,
} ) );

function setViewportIsDesktop( isDesktop: boolean ) {
	window.matchMedia = jest.fn().mockReturnValue( { matches: isDesktop } );
}

function setSearch( search: string ) {
	window.history.replaceState( null, '', `${ window.location.pathname }${ search }` );
}

describe( 'useSmallViewportDefaultClosed', () => {
	beforeEach( () => {
		mockSetIsOpen.mockClear();
		mockState = { hasLoaded: true, isOpen: true };
		setSearch( '' );
	} );

	it( 'closes a persisted-open chat on a small viewport, without saving', () => {
		setViewportIsDesktop( false );

		const { result, rerender } = renderHook( () => useSmallViewportDefaultClosed() );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( false, false );
		expect( result.current ).toBe( false );

		// Handled once the store reflects the closed state.
		mockState = { hasLoaded: true, isOpen: false };
		rerender();
		expect( result.current ).toBe( true );
		expect( mockSetIsOpen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for the persisted state to load before deciding', () => {
		setViewportIsDesktop( false );
		mockState = { hasLoaded: false, isOpen: false };

		const { result, rerender } = renderHook( () => useSmallViewportDefaultClosed() );
		expect( mockSetIsOpen ).not.toHaveBeenCalled();
		expect( result.current ).toBe( false );

		mockState = { hasLoaded: true, isOpen: true };
		rerender();
		expect( mockSetIsOpen ).toHaveBeenCalledWith( false, false );
	} );

	it( 'does nothing on a desktop viewport', () => {
		setViewportIsDesktop( true );

		const { result } = renderHook( () => useSmallViewportDefaultClosed() );

		expect( mockSetIsOpen ).not.toHaveBeenCalled();
		expect( result.current ).toBe( true );
	} );

	it( 'defers to an explicit ?ai-open=true', () => {
		setViewportIsDesktop( false );
		setSearch( '?ai-open=true' );

		const { result } = renderHook( () => useSmallViewportDefaultClosed() );

		expect( mockSetIsOpen ).not.toHaveBeenCalled();
		expect( result.current ).toBe( true );
	} );

	it( 'leaves a chat that was already closed alone', () => {
		setViewportIsDesktop( false );
		mockState = { hasLoaded: true, isOpen: false };

		const { result } = renderHook( () => useSmallViewportDefaultClosed() );

		expect( mockSetIsOpen ).not.toHaveBeenCalled();
		expect( result.current ).toBe( true );
	} );

	it( 'respects the host-configured desktop media query', () => {
		const matchMedia = jest.fn().mockReturnValue( { matches: true } );
		window.matchMedia = matchMedia;
		window.__agentsManagerActions = {
			desktopMediaQuery: '(min-width: 960px)',
		} as unknown as Window[ '__agentsManagerActions' ];

		try {
			renderHook( () => useSmallViewportDefaultClosed() );
			expect( matchMedia ).toHaveBeenCalledWith( '(min-width: 960px)' );
		} finally {
			delete window.__agentsManagerActions;
		}
	} );
} );

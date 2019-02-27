/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
let viewport;

const matchesMock = jest.fn( () => 'foo' );
const addListenerMock = jest.fn();
const removeListenerMock = jest.fn();

const matchMediaMock = jest.fn( query => {
	const mediaListObjectMock = {
		addListener: listener => addListenerMock( query, listener ),
		removeListener: listener => removeListenerMock( query, listener ),
	};
	// Add matches read-only property.
	Object.defineProperty( mediaListObjectMock, 'matches', {
		get: () => matchesMock( query ),
	} );
	return mediaListObjectMock;
} );

describe( 'viewport', () => {
	beforeAll( async () => {
		window.matchMedia = matchMediaMock;
		viewport = await import( '..' );
	} );

	beforeEach( () => {
		matchesMock.mockClear();
		addListenerMock.mockClear();
		removeListenerMock.mockClear();
	} );

	describe( 'isWithinBreakpoint', () => {
		test( 'should return undefined when called with no breakpoint', () => {
			expect( viewport.isWithinBreakpoint() ).toBe( undefined );
		} );

		test( 'should return undefined for an unknown breakpoint', () => {
			expect( viewport.isWithinBreakpoint( 'unknown' ) ).toBe( undefined );
		} );

		test( 'should retrieve the current status for a known breakpoint', () => {
			expect( viewport.isWithinBreakpoint( '<960px' ) ).toBe( 'foo' );
			expect( matchesMock ).toHaveBeenCalledTimes( 1 );
			expect( matchesMock ).toHaveBeenCalledWith( '(max-width: 960px)' );
		} );
	} );

	describe( 'isMobile', () => {
		test( 'should retrieve the current status for the mobile breakpoint', () => {
			expect( viewport.isMobile() ).toBe( 'foo' );
			expect( matchesMock ).toHaveBeenCalledTimes( 1 );
			expect( matchesMock ).toHaveBeenCalledWith( '(max-width: 480px)' );
		} );
	} );

	describe( 'isDesktop', () => {
		test( 'should retrieve the current status for the desktop breakpoint', () => {
			expect( viewport.isDesktop() ).toBe( 'foo' );
			expect( matchesMock ).toHaveBeenCalledTimes( 1 );
			expect( matchesMock ).toHaveBeenCalledWith( '(min-width: 961px)' );
		} );
	} );

	describe( 'addWithinBreakpointListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.addWithinBreakpointListener() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an invalid breakpoint is provided', () => {
			expect( () => viewport.addWithinBreakpointListener( 'unknown', () => '' ) ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if no listener is provided', () => {
			expect( () => viewport.addWithinBreakpointListener( '<960px' ) ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener for a valid breakpoint', () => {
			const listener = jest.fn();
			const event = { matches: 'bar' };
			expect( () => viewport.addWithinBreakpointListener( '<960px', listener ) ).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(max-width: 960px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ]( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			try {
				viewport.removeWithinBreakpointListener( '<960px', listener );
			} catch {}
		} );
	} );

	describe( 'addIsMobileListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.addIsMobileListener() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener', () => {
			const listener = jest.fn();
			const event = { matches: 'bar' };
			expect( () => viewport.addIsMobileListener( listener ) ).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(max-width: 480px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ]( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			try {
				viewport.removeIsMobileListener( listener );
			} catch {}
		} );
	} );

	describe( 'addIsDesktopListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.addIsDesktopListener() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener', () => {
			const listener = jest.fn();
			const event = { matches: 'bar' };
			expect( () => viewport.addIsDesktopListener( listener ) ).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(min-width: 961px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ]( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			try {
				viewport.removeIsDesktopListener( listener );
			} catch {}
		} );
	} );

	describe( 'removeWithinBreakpointListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.removeWithinBreakpointListener() ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an invalid breakpoint is provided', () => {
			expect( () => viewport.removeWithinBreakpointListener( 'unknown', () => '' ) ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if no listener is provided', () => {
			expect( () => viewport.removeWithinBreakpointListener( '<960px' ) ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an unregistered listener is provided', () => {
			expect( () => viewport.removeWithinBreakpointListener( '<960px', () => '' ) ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should remove an added listener', () => {
			const listener = jest.fn();
			viewport.addWithinBreakpointListener( '<960px', listener );
			// Get listener that actually got added.
			const addedListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];

			expect( () => viewport.removeWithinBreakpointListener( '<960px', listener ) ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(max-width: 960px)', addedListener );
		} );
	} );

	describe( 'removeIsMobileListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.removeIsMobileListener() ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an unregistered listener is provided', () => {
			expect( () => viewport.removeIsMobileListener( () => '' ) ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should remove an added listener', () => {
			const listener = jest.fn();
			viewport.addIsMobileListener( listener );
			// Get listener that actually got added.
			const addedListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];

			expect( () => viewport.removeIsMobileListener( listener ) ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(max-width: 480px)', addedListener );
		} );
	} );

	describe( 'removeIsDesktopListener', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.removeIsDesktopListener() ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an unregistered listener is provided', () => {
			expect( () => viewport.removeIsDesktopListener( () => '' ) ).not.toThrow();
			expect( removeListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should remove an added listener', () => {
			const listener = jest.fn();
			viewport.addIsDesktopListener( listener );
			// Get listener that actually got added.
			const addedListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];

			expect( () => viewport.removeIsDesktopListener( listener ) ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(min-width: 961px)', addedListener );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
let viewport;

const matchesMock = vi.fn( () => 'foo' );
const addListenerMock = vi.fn();
const removeListenerMock = vi.fn();

const matchMediaMock = vi.fn( ( query ) => {
	const mediaListObjectMock = {
		addListener: ( listener ) => addListenerMock( query, listener ),
		removeListener: ( listener ) => removeListenerMock( query, listener ),
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
		viewport = await import( '../src' );
		// Disable console warnings.
		vi.spyOn( console, 'warn' ).mockImplementation( () => '' );
	} );

	beforeEach( () => {
		matchesMock.mockClear();
		addListenerMock.mockClear();
		removeListenerMock.mockClear();
	} );

	afterAll( () => {
		vi.restoreAllMocks();
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

	describe( 'subscribeIsWithinBreakpoint', () => {
		test( 'should do nothing if nothing is provided', () => {
			let unsubscribe;
			expect( () => ( unsubscribe = viewport.subscribeIsWithinBreakpoint() ) ).not.toThrow();
			expect( () => unsubscribe() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if an invalid breakpoint is provided', () => {
			let unsubscribe;
			expect(
				() => ( unsubscribe = viewport.subscribeIsWithinBreakpoint( 'unknown', () => '' ) )
			).not.toThrow();
			expect( () => unsubscribe() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should do nothing if no listener is provided', () => {
			let unsubscribe;
			expect(
				() => ( unsubscribe = viewport.subscribeIsWithinBreakpoint( '<960px' ) )
			).not.toThrow();
			expect( () => unsubscribe() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener for a valid breakpoint', () => {
			const listener = vi.fn();
			const event = { matches: 'bar' };
			let unsubscribe;
			expect(
				() => ( unsubscribe = viewport.subscribeIsWithinBreakpoint( '<960px', listener ) )
			).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(max-width: 960px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			const registeredListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];
			registeredListener( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			expect( () => unsubscribe() ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(max-width: 960px)', registeredListener );
		} );
	} );

	describe( 'subscribeIsMobile', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.subscribeIsMobile() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener', () => {
			const listener = vi.fn();
			const event = { matches: 'bar' };
			let unsubscribe;
			expect( () => ( unsubscribe = viewport.subscribeIsMobile( listener ) ) ).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(max-width: 480px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			const registeredListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];
			registeredListener( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			expect( () => unsubscribe() ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(max-width: 480px)', registeredListener );
		} );
	} );

	describe( 'subscribeIsDesktop', () => {
		test( 'should do nothing if nothing is provided', () => {
			expect( () => viewport.subscribeIsDesktop() ).not.toThrow();
			expect( addListenerMock ).not.toHaveBeenCalled();
		} );
		test( 'should add a listener', () => {
			const listener = vi.fn();
			const event = { matches: 'bar' };
			let unsubscribe;
			expect( () => ( unsubscribe = viewport.subscribeIsDesktop( listener ) ) ).not.toThrow();
			expect( addListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( addListenerMock ).toHaveBeenCalledWith(
				'(min-width: 961px)',
				expect.any( Function )
			);
			// Call registered listener to make sure it got added correctly.
			const registeredListener =
				addListenerMock.mock.calls[ addListenerMock.mock.calls.length - 1 ][ 1 ];
			registeredListener( event );
			expect( listener ).toHaveBeenCalledTimes( 1 );
			expect( listener ).toHaveBeenCalledWith( 'bar' );
			// Clean up.
			expect( () => unsubscribe() ).not.toThrow();
			expect( removeListenerMock ).toHaveBeenCalledTimes( 1 );
			expect( removeListenerMock ).toHaveBeenCalledWith( '(min-width: 961px)', registeredListener );
		} );
	} );
} );

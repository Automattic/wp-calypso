/**
 * @jest-environment jsdom
 */

import { getAccountAgeInDays, setSurvicateVisitorTraits } from '../visitor-traits';

const DAY_IN_MS = 86400000;

describe( 'getAccountAgeInDays', () => {
	test( 'should return the number of whole days since the given date string', () => {
		const threeDaysAgo = new Date( Date.now() - 3 * DAY_IN_MS ).toISOString();
		expect( getAccountAgeInDays( threeDaysAgo ) ).toBe( 3 );
	} );

	test( 'should floor partial days', () => {
		const oneAndAHalfDaysAgo = new Date( Date.now() - 1.5 * DAY_IN_MS ).toISOString();
		expect( getAccountAgeInDays( oneAndAHalfDaysAgo ) ).toBe( 1 );
	} );

	test( 'should return 0 for today', () => {
		expect( getAccountAgeInDays( new Date().toISOString() ) ).toBe( 0 );
	} );
} );

describe( 'setSurvicateVisitorTraits', () => {
	beforeEach( () => {
		window._sva = undefined;
	} );

	afterEach( () => {
		window._sva = undefined;
	} );

	describe( 'when _sva is not yet available (event-based path)', () => {
		test( 'should set visitor traits when SurvicateReady fires', () => {
			const setVisitorTraits = jest.fn();

			// _sva not available at call time
			setSurvicateVisitorTraits( { email: 'test@example.com' } );

			// Should not be called before the event fires
			expect( setVisitorTraits ).not.toHaveBeenCalled();

			// Simulate Survicate becoming ready
			window._sva = { setVisitorTraits };
			window.dispatchEvent( new Event( 'SurvicateReady' ) );

			expect( setVisitorTraits ).toHaveBeenCalledWith( { email: 'test@example.com' } );
		} );

		test( 'should not throw when _sva is still undefined at event time', () => {
			window._sva = undefined;

			setSurvicateVisitorTraits( { email: 'test@example.com' } );

			expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
		} );

		test( 'should not throw when setVisitorTraits is not available at event time', () => {
			setSurvicateVisitorTraits( { email: 'test@example.com' } );

			window._sva = {};
			expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
		} );

		test( 'should not call setVisitorTraits before the event fires', () => {
			const setVisitorTraits = jest.fn();

			setSurvicateVisitorTraits( { email: 'test@example.com' } );

			// _sva becomes available but event hasn't fired
			window._sva = { setVisitorTraits };
			expect( setVisitorTraits ).not.toHaveBeenCalled();

			window.dispatchEvent( new Event( 'SurvicateReady' ) );
			expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should return a cleanup function that removes the listener', () => {
			const setVisitorTraits = jest.fn();

			const cleanup = setSurvicateVisitorTraits( { email: 'test@example.com' } );

			cleanup();

			window._sva = { setVisitorTraits };
			window.dispatchEvent( new Event( 'SurvicateReady' ) );
			expect( setVisitorTraits ).not.toHaveBeenCalled();
		} );

		test( 'should only fire once due to { once: true }', () => {
			const setVisitorTraits = jest.fn();

			setSurvicateVisitorTraits( { email: 'test@example.com' } );

			window._sva = { setVisitorTraits };
			window.dispatchEvent( new Event( 'SurvicateReady' ) );
			window.dispatchEvent( new Event( 'SurvicateReady' ) );

			expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'when _sva is already available (immediate path)', () => {
		test( 'should set traits immediately', () => {
			const setVisitorTraits = jest.fn();
			window._sva = { setVisitorTraits };

			setSurvicateVisitorTraits( { email: 'already@loaded.com' } );

			expect( setVisitorTraits ).toHaveBeenCalledWith( { email: 'already@loaded.com' } );
			expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should return a no-op cleanup function', () => {
			const setVisitorTraits = jest.fn();
			window._sva = { setVisitorTraits };

			const cleanup = setSurvicateVisitorTraits( { email: 'already@loaded.com' } );

			expect( typeof cleanup ).toBe( 'function' );
			expect( () => cleanup() ).not.toThrow();

			// Dispatching the event after immediate set should not call again
			window.dispatchEvent( new Event( 'SurvicateReady' ) );
			expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should only call setVisitorTraits once even if event fires', () => {
			const setVisitorTraits = jest.fn();
			window._sva = { setVisitorTraits };

			setSurvicateVisitorTraits( { email: 'already@loaded.com' } );

			window.dispatchEvent( new Event( 'SurvicateReady' ) );
			window.dispatchEvent( new Event( 'SurvicateReady' ) );

			expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

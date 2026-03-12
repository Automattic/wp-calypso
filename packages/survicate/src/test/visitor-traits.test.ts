/**
 * @jest-environment jsdom
 */

import { setSurvicateVisitorTraits } from '../visitor-traits';

describe( 'setSurvicateVisitorTraits', () => {
	beforeEach( () => {
		window._sva = undefined;
	} );

	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should set visitor traits when SurvicateReady fires', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		// Should not be called before the event fires
		expect( setVisitorTraits ).not.toHaveBeenCalled();

		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( setVisitorTraits ).toHaveBeenCalledWith( { email: 'test@example.com' } );
	} );

	test( 'should not throw when _sva is undefined', () => {
		window._sva = undefined;

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
	} );

	test( 'should not throw when setVisitorTraits is not available', () => {
		window._sva = {};

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
	} );

	test( 'should not call setVisitorTraits before the event fires', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		expect( setVisitorTraits ).not.toHaveBeenCalled();

		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should return a cleanup function that removes the listener', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		const cleanup = setSurvicateVisitorTraits( { email: 'test@example.com' } );

		cleanup();

		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( setVisitorTraits ).not.toHaveBeenCalled();
	} );

	test( 'should only fire once due to { once: true }', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
	} );
} );

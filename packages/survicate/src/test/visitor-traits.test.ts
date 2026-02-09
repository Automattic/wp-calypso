/**
 * @jest-environment jsdom
 */

import { setSurvicateVisitorTraits } from '../visitor-traits';

describe( 'setSurvicateVisitorTraits', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		window._sva = undefined;
	} );

	afterEach( () => {
		jest.useRealTimers();
		window._sva = undefined;
	} );

	test( 'should set visitor traits after a 1000ms delay', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		// Should not be called immediately
		expect( setVisitorTraits ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1000 );

		expect( setVisitorTraits ).toHaveBeenCalledWith( { email: 'test@example.com' } );
	} );

	test( 'should not throw when _sva is undefined', () => {
		window._sva = undefined;

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		expect( () => jest.advanceTimersByTime( 1000 ) ).not.toThrow();
	} );

	test( 'should not throw when setVisitorTraits is not available', () => {
		window._sva = {};

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		expect( () => jest.advanceTimersByTime( 1000 ) ).not.toThrow();
	} );

	test( 'should not call setVisitorTraits before the delay', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		setSurvicateVisitorTraits( { email: 'test@example.com' } );

		jest.advanceTimersByTime( 999 );
		expect( setVisitorTraits ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1 );
		expect( setVisitorTraits ).toHaveBeenCalledTimes( 1 );
	} );
} );

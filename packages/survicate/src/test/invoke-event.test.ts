/**
 * @jest-environment jsdom
 */

import { invokeSurvicateEvent, setSurvicateEventSuppression } from '../invoke-event';

describe( 'invokeSurvicateEvent', () => {
	beforeEach( () => {
		window._sva = undefined;
		setSurvicateEventSuppression( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		setSurvicateEventSuppression( false );
	} );

	test( 'should call invokeEvent immediately when window._sva.invokeEvent exists', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should return a cleanup function', () => {
		const cleanup = invokeSurvicateEvent( 'testEvent' );

		expect( typeof cleanup ).toBe( 'function' );
	} );

	test( 'should invoke event when SurvicateReady fires and SDK was not ready initially', () => {
		const invokeEvent = jest.fn();
		window._sva = undefined;

		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).not.toHaveBeenCalled();

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should not invoke event when cleanup is called before SurvicateReady', () => {
		const invokeEvent = jest.fn();

		const cleanup = invokeSurvicateEvent( 'testEvent' );

		cleanup();

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should only invoke once even if SurvicateReady fires multiple times', () => {
		const invokeEvent = jest.fn();
		window._sva = undefined;

		invokeSurvicateEvent( 'testEvent' );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should not throw when _sva is undefined at SurvicateReady time', () => {
		window._sva = undefined;

		invokeSurvicateEvent( 'testEvent' );

		expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
	} );

	test( 'should not throw when invokeEvent is not available on _sva at SurvicateReady time', () => {
		window._sva = undefined;

		invokeSurvicateEvent( 'testEvent' );

		window._sva = {};
		expect( () => window.dispatchEvent( new Event( 'SurvicateReady' ) ) ).not.toThrow();
	} );

	test( 'should not throw in any case', () => {
		window._sva = undefined;
		expect( () => invokeSurvicateEvent( 'testEvent' ) ).not.toThrow();

		window._sva = {};
		expect( () => invokeSurvicateEvent( 'testEvent' ) ).not.toThrow();

		window._sva = { invokeEvent: jest.fn() };
		expect( () => invokeSurvicateEvent( 'testEvent' ) ).not.toThrow();
	} );
} );

describe( 'setSurvicateEventSuppression', () => {
	beforeEach( () => {
		window._sva = undefined;
		setSurvicateEventSuppression( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		setSurvicateEventSuppression( false );
	} );

	test( 'should prevent invokeSurvicateEvent from firing when suppressed', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		setSurvicateEventSuppression( true );
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should return a no-op cleanup when suppressed', () => {
		window._sva = { invokeEvent: jest.fn() };

		setSurvicateEventSuppression( true );
		const cleanup = invokeSurvicateEvent( 'testEvent' );

		expect( typeof cleanup ).toBe( 'function' );
		expect( () => cleanup() ).not.toThrow();
	} );

	test( 'should allow events again after suppression is turned off', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		setSurvicateEventSuppression( true );
		invokeSurvicateEvent( 'testEvent' );
		expect( invokeEvent ).not.toHaveBeenCalled();

		setSurvicateEventSuppression( false );
		invokeSurvicateEvent( 'testEvent' );
		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );
} );

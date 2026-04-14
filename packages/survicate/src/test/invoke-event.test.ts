/**
 * @jest-environment jsdom
 */

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
} ) );

import { select } from '@wordpress/data';
import { invokeSurvicateEvent } from '../invoke-event';

const mockSelect = select as jest.Mock;

function setHelpCenterOpen( open: boolean ) {
	mockSelect.mockReturnValue( { isHelpCenterShown: () => open } );
}

function setHelpCenterStoreUnavailable() {
	mockSelect.mockImplementation( () => {
		throw new Error( 'Store not registered' );
	} );
}

describe( 'invokeSurvicateEvent', () => {
	beforeEach( () => {
		window._sva = undefined;
		setHelpCenterOpen( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		mockSelect.mockReset();
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

describe( 'Help Center suppression', () => {
	beforeEach( () => {
		window._sva = undefined;
		setHelpCenterOpen( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		mockSelect.mockReset();
	} );

	test( 'should suppress event when Help Center is open', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		setHelpCenterOpen( true );
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should return a no-op cleanup when suppressed', () => {
		window._sva = { invokeEvent: jest.fn() };

		setHelpCenterOpen( true );
		const cleanup = invokeSurvicateEvent( 'testEvent' );

		expect( typeof cleanup ).toBe( 'function' );
		expect( () => cleanup() ).not.toThrow();
	} );

	test( 'should close open survey when event is suppressed', () => {
		const closeSurvey = jest.fn();
		window._sva = { invokeEvent: jest.fn(), closeSurvey };

		setHelpCenterOpen( true );
		invokeSurvicateEvent( 'testEvent' );

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should allow events when Help Center is closed', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		setHelpCenterOpen( false );
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should suppress deferred event when Help Center opens before SurvicateReady', () => {
		const invokeEvent = jest.fn();
		window._sva = undefined;

		setHelpCenterOpen( false );
		invokeSurvicateEvent( 'testEvent' );

		setHelpCenterOpen( true );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should not throw when Help Center store is not registered', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		setHelpCenterStoreUnavailable();
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should handle select returning undefined gracefully', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		mockSelect.mockReturnValue( undefined );
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );
} );

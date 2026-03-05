/**
 * @jest-environment jsdom
 */

import { invokeSurvicateEvent } from '../invoke-event';

describe( 'invokeSurvicateEvent', () => {
	beforeEach( () => {
		window._sva = undefined;
	} );

	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should return true and call invokeEvent when window._sva.invokeEvent exists', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		const result = invokeSurvicateEvent( 'testEvent' );

		expect( result ).toBe( true );
		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should return false when window._sva is undefined', () => {
		window._sva = undefined;

		const result = invokeSurvicateEvent( 'testEvent' );

		expect( result ).toBe( false );
	} );

	test( 'should return false when invokeEvent is not available on _sva', () => {
		window._sva = {};

		const result = invokeSurvicateEvent( 'testEvent' );

		expect( result ).toBe( false );
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

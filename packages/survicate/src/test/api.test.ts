/**
 * @jest-environment jsdom
 */

import { getSurvicateApi } from '../api';

describe( 'getSurvicateApi', () => {
	beforeEach( () => {
		window._sva = undefined;
	} );

	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should return null when _sva is undefined', () => {
		expect( getSurvicateApi() ).toBeNull();
	} );

	test( 'should return the API when _sva exists', () => {
		const mockSva = {
			setVisitorTraits: jest.fn(),
			invokeEvent: jest.fn(),
			destroyVisitor: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		};
		window._sva = mockSva;

		const api = getSurvicateApi();

		expect( api ).not.toBeNull();
	} );

	test( 'should delegate setVisitorTraits to _sva', () => {
		const setVisitorTraits = jest.fn();
		window._sva = { setVisitorTraits };

		const api = getSurvicateApi();
		api?.setVisitorTraits( { email: 'test@example.com' } );

		expect( setVisitorTraits ).toHaveBeenCalledWith( { email: 'test@example.com' } );
	} );

	test( 'should delegate invokeEvent to _sva', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		const api = getSurvicateApi();
		api?.invokeEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should delegate destroyVisitor to _sva', () => {
		const destroyVisitor = jest.fn();
		window._sva = { destroyVisitor };

		const api = getSurvicateApi();
		api?.destroyVisitor();

		expect( destroyVisitor ).toHaveBeenCalled();
	} );

	test( 'should delegate addEventListener to _sva', () => {
		const addEventListener = jest.fn();
		window._sva = { addEventListener };

		const callback = jest.fn();
		const api = getSurvicateApi();
		api?.addEventListener( 'survey_displayed', callback );

		expect( addEventListener ).toHaveBeenCalledWith( 'survey_displayed', callback );
	} );

	test( 'should delegate removeEventListener to _sva', () => {
		const removeEventListener = jest.fn();
		window._sva = { removeEventListener };

		const callback = jest.fn();
		const api = getSurvicateApi();
		api?.removeEventListener( 'survey_displayed', callback );

		expect( removeEventListener ).toHaveBeenCalledWith( 'survey_displayed', callback );
	} );
} );

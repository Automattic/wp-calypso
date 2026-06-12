/**
 * @jest-environment jsdom
 */

import { closeSurvicateSurvey } from '../close-survey';

describe( 'closeSurvicateSurvey', () => {
	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should call closeSurvey when the SDK is loaded', () => {
		const closeSurvey = jest.fn();
		window._sva = { closeSurvey };

		closeSurvicateSurvey();

		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should be a no-op when the SDK is not loaded', () => {
		window._sva = undefined;

		expect( () => closeSurvicateSurvey() ).not.toThrow();
	} );

	test( 'should be a no-op when closeSurvey is unavailable', () => {
		window._sva = {};

		expect( () => closeSurvicateSurvey() ).not.toThrow();
	} );
} );

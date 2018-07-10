/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import './matchers';
import supportedMatchers from './supported-matchers';

/**
 * Sets spy on the console object's method to make it possible to fail test when method called without assertion.
 *
 * @param {string} matcherName Name of Jest matcher.
 * @param {string} methodName Name of console method.
 */
const setConsoleMethodSpy = ( matcherName, methodName ) => {
	const spy = jest.spyOn( console, methodName ).mockName( `console.${ methodName }` );

	beforeEach( () => {
		spy.mockReset();
		spy.assertionsNumber = 0;
	} );

	afterEach( () => {
		if ( spy.assertionsNumber === 0 && spy.mock.calls.length > 0 ) {
			expect( console ).not[ matcherName ]();
		}
	} );
};

forEach( supportedMatchers, setConsoleMethodSpy );

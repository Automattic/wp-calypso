/** @format */

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_DEPENDENCY_STORE_UPDATE, SIGNUP_COMPLETE_RESET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the signup store', () => {
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_DEPENDENCY_STORE_UPDATE,
					dependencies: { test: 123 },
				}
			)
		).toEqual( { test: 123 } );
	} );

	test( 'should reset the signup store', () => {
		expect(
			signupDependencyStore(
				{ test: 123 },
				{
					type: SIGNUP_COMPLETE_RESET,
				}
			)
		).toEqual( {} );
	} );
} );

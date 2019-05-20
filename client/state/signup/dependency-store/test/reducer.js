/** @format */

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import {
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_COMPLETE_RESET,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should rewrite the dependencies', () => {
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

	test( 'should add dependencies on step submit or completion', () => {
		expect(
			signupDependencyStore(
				{ foo: 123 },
				{
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { providedDependencies: { bar: 456 } },
				}
			)
		).toEqual( { foo: 123, bar: 456 } );
	} );

	test( 'should reset the dependencies', () => {
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

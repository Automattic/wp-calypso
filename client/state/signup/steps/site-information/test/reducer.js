/** @format */

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the site type', () => {
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_STEPS_SITE_INFORMATION_SET,
					siteInformation: 'mushroom-sandwich',
				}
			)
		).toEqual( 'mushroom-sandwich' );
	} );
} );

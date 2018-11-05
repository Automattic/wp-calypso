/** @format */

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the site type', () => {
		const siteInformation = {
			address: '27 Pleasant Crescent',
			phone: '+39 1234 1234',
			email: 'hello@123.com',
		};
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_STEPS_SITE_INFORMATION_SET,
					...siteInformation,
				}
			)
		).toEqual( siteInformation );
	} );
} );

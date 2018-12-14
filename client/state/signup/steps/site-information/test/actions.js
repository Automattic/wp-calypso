/** @format */

/**
 * Internal dependencies
 */
import { setSiteInformation } from '../actions';
import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

describe( 'setSiteInformation()', () => {
	test( 'should return the expected action object', () => {
		const siteInformation = {
			address: '21 Jump Street, Timbuktu - 65030',
			email: 'email@domain.com',
			phone: '+1 (555) 555-5555',
		};

		expect( setSiteInformation( siteInformation ) ).toEqual( {
			type: SIGNUP_STEPS_SITE_INFORMATION_SET,
			...siteInformation,
		} );
	} );
} );

/** @format */

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_STEPS_SITE_STYLE_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the site style', () => {
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_STEPS_SITE_STYLE_SET,
					siteStyle: 'prodigious-gravy',
				}
			)
		).toEqual( 'prodigious-gravy' );
	} );
} );

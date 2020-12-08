/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_STEPS_SITE_TYPE_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should update the site type', () => {
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_STEPS_SITE_TYPE_SET,
					siteType: 'mushroom-sandwich',
				}
			)
		).toEqual( 'mushroom-sandwich' );
	} );
} );

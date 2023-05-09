import { SIGNUP_STEPS_SITE_TYPE_SET } from 'calypso/state/action-types';
import signupDependencyStore from '../reducer';

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

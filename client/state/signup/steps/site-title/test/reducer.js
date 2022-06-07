import { SIGNUP_STEPS_SITE_TITLE_SET } from 'calypso/state/action-types';
import signupDependencyStore from '../reducer';

describe( 'reducer', () => {
	test( 'should update the site title', () => {
		expect(
			signupDependencyStore(
				{},
				{
					type: SIGNUP_STEPS_SITE_TITLE_SET,
					siteTitle: 'site title',
				}
			)
		).toEqual( 'site title' );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import { SIGNUP_STEPS_SITE_TITLE_SET } from 'calypso/state/action-types';

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
		).to.be.eql( 'site title' );
	} );
} );

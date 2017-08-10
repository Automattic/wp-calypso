/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TITLE_SET } from 'state/action-types';

import signupDependencyStore from '../reducer';

describe( 'reducer', () => {
	it( 'should update the site title', () => {
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

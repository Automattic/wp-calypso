/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_SITE_GOALS_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should update the site goals', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_GOALS_SET,
					siteGoals: 'Showcase creative work',
				}
			)
		).to.be.eql( 'Showcase creative work' );
	} );
} );

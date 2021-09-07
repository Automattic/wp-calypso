import { expect } from 'chai';
import { SIGNUP_STEPS_SITE_GOALS_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

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

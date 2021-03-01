/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_USER_EXPERIENCE_SET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( "should add the user's experience level", () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_USER_EXPERIENCE_SET,
					userExperience: 5,
				}
			)
		).to.be.eql( 5 );
	} );
} );

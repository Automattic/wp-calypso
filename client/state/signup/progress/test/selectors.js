/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSignupProgress } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty, plain object as a default state', () => {
		const state = { signup: undefined };
		expect( getSignupProgress( state ) ).to.be.eql( {} );
	} );

	test( 'should select progress from the state', () => {
		const progress = {
			'site-selection': {
				status: 'completed',
				stepName: 'site-selection',
			},
		};
		const state = { signup: { progress } };

		expect( getSignupProgress( state ) ).to.be.eql( progress );
	} );
} );

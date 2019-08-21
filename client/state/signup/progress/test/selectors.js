/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSignupProgress } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty array as a default state', () => {
		const state = { signup: undefined };
		expect( getSignupProgress( state, [] ) ).to.be.eql( [] );
	} );

	test( 'should return signupDependencyStore instance from the state', () => {
		const state = {
			signup: {
				progress: [
					{
						status: 'completed',
						stepName: 'site-selection',
					},
				],
			},
		};
		expect( getSignupProgress( state, [] ) ).to.be.eql( [
			{
				status: 'completed',
				stepName: 'site-selection',
			},
		] );
	} );
} );

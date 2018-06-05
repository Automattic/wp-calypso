/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSignupDependencies } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty object as a default state', () => {
		expect( getSignupDependencies( { signup: undefined }, {} ) ).to.be.eql( {} );
	} );

	test( 'should return signupDependencyStore instance from the state', () => {
		expect(
			getSignupDependencies(
				{
					signup: {
						dependencyStore: { test: 123 },
					},
				},
				{}
			)
		).to.be.eql( { test: 123 } );
	} );
} );

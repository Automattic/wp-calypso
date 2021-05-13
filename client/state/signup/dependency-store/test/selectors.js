/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSignupDependencyStore } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty object as a default state', () => {
		expect( getSignupDependencyStore( { signup: undefined }, {} ) ).to.be.eql( {} );
	} );

	test( 'should return signupDependencyStore instance from the state', () => {
		expect(
			getSignupDependencyStore(
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

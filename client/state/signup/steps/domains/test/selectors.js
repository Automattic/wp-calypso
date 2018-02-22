/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDomainSearchPrefill } from '../selectors';

describe( 'selectors', () => {
	describe( 'domain search prefill', () => {
		test( 'should return empty string as a default state', () => {
			expect( getDomainSearchPrefill( { signup: undefined } ) ).to.be.eql( '' );
		} );

		test( 'should return the value from the state', () => {
			expect(
				getDomainSearchPrefill( {
					signup: {
						steps: {
							domains: {
								prefill: 'existing value',
							},
						},
					},
				} )
			).to.be.eql( 'existing value' );
		} );
	} );
} );

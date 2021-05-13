/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDesignType } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getDesignType( { signup: undefined } ) ).to.be.eql( '' );
	} );

	test( 'should return design type from the state', () => {
		expect(
			getDesignType( {
				signup: {
					steps: {
						designType: 'design type',
					},
				},
			} )
		).to.be.eql( 'design type' );
	} );
} );

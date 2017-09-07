/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJpoConnect } from '../';

describe( 'selectors', () => {
	it( 'should return empty string as a default state', () => {
		expect( getJpoConnect( { signup: undefined } ) ).to.be.eql( '' );
	} );

	it( 'should return jpoConnect type from the state', () => {
		expect( getJpoConnect( {
			signup: {
				dependencyStore: {
					jpoConnect: 'connect'
				}
			}
		} ) ).to.be.eql( 'connect' );
	} );
} );

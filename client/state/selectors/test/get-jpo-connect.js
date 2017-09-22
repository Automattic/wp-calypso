/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJpoConnect } from '../';

describe( 'getJpoConnect', () => {
	it( 'should return null as a default state', () => {
		expect( getJpoConnect( { signup: undefined } ) ).to.be.null;
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

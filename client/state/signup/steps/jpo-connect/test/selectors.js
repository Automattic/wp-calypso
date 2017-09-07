/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJPOConnect } from '../selectors';

describe( 'selectors', () => {
	it( 'should return empty string as a default state', () => {
		expect( getJPOConnect( { signup: undefined } ) ).to.be.eql( '' );
	} );

	it( 'should return jpoConnect type from the state', () => {
		expect( getJPOConnect( {
			signup: {
				dependencyStore: {
					jpoConnect: 'connect'
				}
			}
		} ) ).to.be.eql( 'connect' );
	} );
} );

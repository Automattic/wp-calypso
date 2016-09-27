/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteTitle } from '../selectors';

describe( 'selectors', () => {
	it( 'should return empty string as a default state', () => {
		expect( getSiteTitle( { signup: undefined } ) ).to.be.eql( '' );
	} );

	it( 'should return Site Title from the state', () => {
		expect( getSiteTitle( {
			signup: {
				steps: {
					siteTitle: 'Site Title'
				}
			}
		} ) ).to.be.eql( 'Site Title' );
	} );
} );

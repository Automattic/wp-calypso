/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteTitle } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSiteTitle( { signup: undefined } ) ).to.be.eql( '' );
	} );

	test( 'should return Site Title from the state', () => {
		expect(
			getSiteTitle( {
				signup: {
					steps: {
						siteTitle: 'Site Title',
					},
				},
			} )
		).to.be.eql( 'Site Title' );
	} );
} );

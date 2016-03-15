/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSite } from '../selectors';

describe( 'selectors', () => {
	describe( '#getSite()', () => {
		it( 'should return null if the site is not known', () => {
			const site = getSite( {
				sites: {
					items: {}
				}
			}, 2916284 );

			expect( site ).to.be.null;
		} );

		it( 'should return the site object', () => {
			const site = getSite( {
				sites: {
					items: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
					}
				}
			}, 2916284 );

			expect( site ).to.eql( { ID: 2916284, name: 'WordPress.com Example Blog' } );
		} );
	} );
} );

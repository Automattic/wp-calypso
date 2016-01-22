/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedSite } from '../selectors';

describe( 'selectors', () => {
	describe( '#getSelectedSite()', () => {
		it( 'should return false if no site is selected', () => {
			const selected = getSelectedSite( {
				ui: {
					selectedSiteId: false
				}
			} );

			expect( selected ).to.be.false;
		} );

		it( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				sites: {
					items: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
					}
				},
				ui: {
					selectedSiteId: 2916284
				}
			} );

			expect( selected ).to.eql( { ID: 2916284, name: 'WordPress.com Example Blog' } );
		} );
	} );
} );

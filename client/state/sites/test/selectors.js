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
		it( 'should return null if no site is selected', () => {
			const selected = getSelectedSite( {
				sites: {
					selected: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				sites: {
					selected: 2916284,
					byId: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
					}
				}
			} );

			expect( selected ).to.eql( { ID: 2916284, name: 'WordPress.com Example Blog' } );
		} );
	} );
} );

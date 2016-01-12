/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedSite, getCurrentUser } from '../selectors';

describe( 'selectors', () => {
	describe( '#getSelectedSite()', () => {
		it( 'should return null if no site is selected', () => {
			const selected = getSelectedSite( {
				ui: {
					selectedSite: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				sites: {
					items: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
					}
				},
				ui: {
					selectedSite: 2916284
				}
			} );

			expect( selected ).to.eql( { ID: 2916284, name: 'WordPress.com Example Blog' } );
		} );
	} );

	describe( '#getCurrentUser()', () => {
		it( 'should return null if no current user', () => {
			const selected = getCurrentUser( {
				ui: {
					currentUserId: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return the object for the current user', () => {
			const selected = getCurrentUser( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' }
					}
				},
				ui: {
					currentUserId: 73705554
				}
			} );

			expect( selected ).to.eql( { ID: 73705554, login: 'testonesite2014' } );
		} );
	} );
} );

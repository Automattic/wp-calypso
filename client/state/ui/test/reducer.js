/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE, USER_SET_CURRENT } from 'state/action-types';
import { selectedSite, currentUser } from '../reducer';

describe( 'reducer', () => {
	describe( '#selectedSite()', () => {
		it( 'should default to null', () => {
			const state = selectedSite( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the selected site ID', () => {
			const state = selectedSite( null, {
				type: SET_SELECTED_SITE,
				siteId: 2916284
			} );

			expect( state ).to.equal( 2916284 );
		} );

		it( 'should set to null if siteId is undefined', () => {
			const state = selectedSite( null, {
				type: SET_SELECTED_SITE,
				siteId: undefined
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( '#currentUser()', () => {
		it( 'should default to null', () => {
			const state = currentUser( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user ID', () => {
			const state = currentUser( null, {
				type: USER_SET_CURRENT,
				userId: 73705554
			} );

			expect( state ).to.equal( 73705554 );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE, CURRENT_USER_ID_SET } from 'state/action-types';
import { selectedSite, currentUserId } from '../reducer';

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

	describe( '#currentUserId()', () => {
		it( 'should default to null', () => {
			const state = currentUserId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user ID', () => {
			const state = currentUserId( null, {
				type: CURRENT_USER_ID_SET,
				userId: 73705554
			} );

			expect( state ).to.equal( 73705554 );
		} );
	} );
} );

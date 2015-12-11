/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE } from 'state/action-types';
import { selectedSite } from '../reducer';

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
	} );
} );

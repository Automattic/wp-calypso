/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE } from 'state/action-types';
import { setSelectedSite } from '../actions';

describe( 'actions', () => {
	describe( '#setSelectedSite()', () => {
		it( 'should return an action object', () => {
			const action = setSelectedSite( 2916284 );

			expect( action ).to.eql( {
				type: SET_SELECTED_SITE,
				siteId: 2916284
			} );
		} );
	} );
} );

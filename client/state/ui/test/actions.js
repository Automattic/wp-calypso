/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SELECTED_SITE_SET } from 'state/action-types';
import { setSelectedSiteId } from '../actions';

describe( 'actions', () => {
	describe( '#setSelectedSiteId()', () => {
		it( 'should return an action object', () => {
			const action = setSelectedSiteId( 2916284 );

			expect( action ).to.eql( {
				type: SELECTED_SITE_SET,
				siteId: 2916284
			} );
		} );
	} );
} );

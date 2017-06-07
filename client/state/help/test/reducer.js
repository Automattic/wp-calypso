/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HELP_SELECTED_SITE,
} from 'state/action-types';
import { selectedSiteId } from '../reducer';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		it( 'should default to null', () => {
			const state = selectedSiteId( undefined, {} );

			expect( state ).to.eql( null );
		} );

		it( 'should store the site id received', () => {
			const state = selectedSiteId( {}, {
				type: HELP_SELECTED_SITE,
				siteId: 1,
			} );

			expect( state ).to.eql( 1 );
		} );
	} );
} );

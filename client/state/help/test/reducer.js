/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HELP_SELECTED_SITE,
	SITES_RECEIVE,
} from 'state/action-types';
import { selectSiteId } from '../actions';

describe( 'reducer', () => {
	describe( '#selectedSiteId()', () => {
		it( 'should default to null', () => {
			const state = selectSiteId( undefined, {} );

			expect( state ).to.eql( null );
		} );

		it( 'should store the site id received', () => {
			const state = selectSiteId( {}, {
				type: HELP_SELECTED_SITE,
				siteId: 1,
			} );

			expect( state ).to.eql( 1 );
		} );

		it( 'should select the first element received', () => {
			const state = selectSiteId( {}, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2
					}
				],
			} );

			expect( state ).to.eql( 2 );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { TITLE_SET, SELECTED_SITE_SET } from 'state/action-types';
import { setTitle, setSelectedSiteId } from '../actions';

describe( 'actions', () => {
	describe( '#setTitle()', () => {
		it( 'should return an action object', () => {
			const action = setTitle( 'Home' );

			expect( action ).to.eql( {
				type: TITLE_SET,
				title: 'Home'
			} );
		} );
	} );

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

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE, USER_SET_CURRENT } from 'state/action-types';
import { setSelectedSite, setCurrentUser } from '../actions';

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

	describe( '#setCurrentUser()', () => {
		it( 'should return an action object', () => {
			const action = setCurrentUser( 73705554 );

			expect( action ).to.eql( {
				type: USER_SET_CURRENT,
				userId: 73705554
			} );
		} );
	} );
} );

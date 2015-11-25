/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SET_SELECTED_SITE,
	RECEIVE_SITE
} from '../action-types';
import {
	setSelectedSite,
	receiveSite
} from '../actions';

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

	describe( '#receiveSite()', () => {
		it( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).to.eql( {
				type: RECEIVE_SITE,
				site
			} );
		} );
	} );
} );

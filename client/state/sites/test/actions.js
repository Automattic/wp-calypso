/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SITE_RECEIVE } from 'state/action-types';
import { receiveSite } from '../actions';

function mockedDispatch( callback ) {
	return callback();
}

describe( 'actions', () => {
	describe( '#receiveSite()', () => {
		it( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).to.eql( {
				type: SITE_RECEIVE,
				site
			} );
		} );
	} );
} );

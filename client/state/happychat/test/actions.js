/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_CONNECTED } from 'state/action-types';
import { setConnected } from '../actions';

describe( 'actions', () => {
	describe( '#setConnected()', () => {
		it( 'should return an action object', () => {
			const action = setConnected( { geo_location: { country_long: 'Romania' } } );

			expect( action ).to.eql( {
				type: HAPPYCHAT_CONNECTED,
				user: { geo_location: { country_long: 'Romania' } },
			} );
		} );
	} );
} );

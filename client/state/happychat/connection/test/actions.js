/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_IO_RECEIVE_INIT } from 'calypso/state/action-types';
import { receiveInit } from '../actions';

describe( 'actions', () => {
	describe( '#receiveInit()', () => {
		test( 'should return an action object', () => {
			const action = receiveInit( { geoLocation: { country_long: 'Romania' } } );

			expect( action ).to.eql( {
				type: HAPPYCHAT_IO_RECEIVE_INIT,
				user: { geoLocation: { country_long: 'Romania' } },
			} );
		} );
	} );
} );

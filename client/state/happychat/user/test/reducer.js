/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_IO_RECEIVE_INIT, DESERIALIZE } from 'calypso/state/action-types';
import { geoLocation } from '../reducer';

describe( '#geoLocation()', () => {
	test( 'should default to null', () => {
		const state = geoLocation( undefined, {} );

		expect( state ).to.be.null;
	} );

	test( 'should set the current user geolocation', () => {
		const state = geoLocation( null, {
			type: HAPPYCHAT_IO_RECEIVE_INIT,
			user: {
				geoLocation: {
					country_long: 'Romania',
					city: 'Timisoara',
				},
			},
		} );

		expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
	} );

	test( 'deserializes correctly', () => {
		const state = geoLocation(
			{ country_long: 'Romania', city: 'Timisoara' },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
	} );
} );

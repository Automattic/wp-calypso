import { HAPPYCHAT_IO_RECEIVE_INIT } from 'calypso/state/action-types';
import { deserialize } from 'calypso/state/utils';
import { geoLocation } from '../reducer';

describe( '#geoLocation()', () => {
	test( 'should default to null', () => {
		const state = geoLocation( undefined, {} );

		expect( state ).toBeNull();
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

		expect( state ).toEqual( { country_long: 'Romania', city: 'Timisoara' } );
	} );

	test( 'deserializes correctly', () => {
		const state = deserialize( geoLocation, { country_long: 'Romania', city: 'Timisoara' } );

		expect( state ).toEqual( { country_long: 'Romania', city: 'Timisoara' } );
	} );
} );

/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { geoLocation } from '../reducer';
import { DESERIALIZE, HAPPYCHAT_CONNECTED } from 'state/action-types';

describe( 'reducers', () => {
	describe( '#geoLocation()', () => {
		it( 'should default to null', () => {
			const state = geoLocation( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user geolocation', () => {
			const state = geoLocation( null, {
				type: HAPPYCHAT_CONNECTED,
				user: {
					geo_location: {
						city: 'Timisoara',
						country_long: 'Romania',
					},
				},
			} );

			expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
		} );

		it( 'returns valid geolocation', () => {
			const state = geoLocation(
				{ country_long: 'Romania', city: 'Timisoara' },
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
		} );
	} );
} );

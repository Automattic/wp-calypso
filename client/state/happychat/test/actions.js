/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setGeoLocation } from '../actions';
import { HAPPYCHAT_SET_GEO_LOCATION } from 'state/action-types';

describe( 'actions', () => {
	describe( '#setGeoLocation()', () => {
		it( 'should return an action object', () => {
			const action = setGeoLocation( { country_long: 'Romania' } );

			expect( action ).to.eql( {
				type: HAPPYCHAT_SET_GEO_LOCATION,
				geoLocation: {
					country_long: 'Romania'
				}
			} );
		} );
	} );
} );

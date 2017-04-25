/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET, CURRENT_USER_GEO_LOCATION_SET } from 'state/action-types';
import { setCurrentUserId, setCurrentUserGeoLocation } from '../actions';

describe( 'actions', () => {
	describe( '#setCurrentUserId()', () => {
		it( 'should return an action object', () => {
			const action = setCurrentUserId( 73705554 );

			expect( action ).to.eql( {
				type: CURRENT_USER_ID_SET,
				userId: 73705554
			} );
		} );
	} );

	describe( '#setCurrentUserGeoLocation()', () => {
		it( 'should return an action object', () => {
			const action = setCurrentUserGeoLocation( { country_long: 'Romania' } );

			expect( action ).to.eql( {
				type: CURRENT_USER_GEO_LOCATION_SET,
				geoLocation: {
					country_long: 'Romania'
				}
			} );
		} );
	} );
} );

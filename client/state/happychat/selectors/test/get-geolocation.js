/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getGeoLocation from '../get-geolocation';

describe( 'selectors', () => {
	describe( 'getGeoLocation', () => {
		it( 'should return null if geoLocation is not set', () => {
			const selected = getGeoLocation( {
				happychat: {
					user: {
						geoLocation: null,
					},
				},
			} );
			expect( selected ).to.equal( null );
		} );
		it( 'should return value if geoLocation is set', () => {
			const selected = getGeoLocation( {
				happychat: {
					user: {
						geoLocation: {
							city: 'Timisoara',
						},
					},
				},
			} );
			expect( selected.city ).to.equal( 'Timisoara' );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getGeoLocation from '../get-geolocation';

describe( 'getGeoLocation', () => {
	test( 'should return null if geoLocation is not set', () => {
		const selected = getGeoLocation( {
			happychat: {
				user: { geoLocation: null },
			},
		} );
		expect( selected ).to.equal( null );
	} );

	test( 'should return value if geoLocation is set', () => {
		const selected = getGeoLocation( {
			happychat: {
				user: {
					geoLocation: {
						city: 'Timisoara',
					},
				},
			},
		} );
		expect( selected ).to.eql( { city: 'Timisoara' } );
	} );
} );

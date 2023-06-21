import getGeoLocation from '../get-geolocation';

describe( 'getGeoLocation', () => {
	test( 'should return null if geoLocation is not set', () => {
		const selected = getGeoLocation( {
			happychat: {
				user: { geoLocation: null },
			},
		} );
		expect( selected ).toBeNull();
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
		expect( selected ).toEqual( { city: 'Timisoara' } );
	} );
} );

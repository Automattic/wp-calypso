import getTimezonesLabel from 'calypso/state/selectors/get-timezones-label';

describe( 'getTimezonesLabel()', () => {
	test( "should return null if `timezones` aren't synced", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {},
				rawOffsets: {},
			},
		};

		const label = getTimezonesLabel( state );

		expect( label ).toBeNull();
	} );

	test( "should return null if `key` isn't defined", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
				rawOffsets: {},
			},
		};

		const label = getTimezonesLabel( state );
		expect( label ).toBeNull();
	} );

	test( 'should return the label of the given key', () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
				rawOffsets: {},
			},
		};

		const label = getTimezonesLabel( state, 'America/Boa_Vista' );
		expect( label ).toEqual( 'Boa Vista' );
	} );
} );

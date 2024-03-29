import getRawOffsets from 'calypso/state/selectors/get-raw-offsets';

describe( 'getRawOffsets()', () => {
	test( "should return null if `timezones` aren't synced", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {},
				rawOffsets: {},
			},
		};

		const manualUTCOffsets = getRawOffsets( state );

		expect( manualUTCOffsets ).toEqual( {} );
	} );

	test( 'should return raw offsets data', () => {
		const state = {
			timezones: {
				rawOffsets: {
					'UTC+0': 'UTC',
					'UTC-12': 'UTC-12',
					'UTC-11.5': 'UTC-11:30',
				},
				labels: {},
				byContinent: {},
			},
		};

		const offsets = getRawOffsets( state );

		expect( offsets ).toEqual( {
			'UTC+0': 'UTC',
			'UTC-12': 'UTC-12',
			'UTC-11.5': 'UTC-11:30',
		} );
	} );
} );

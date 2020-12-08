/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getTimezonesByContinent from 'calypso/state/selectors/get-timezones-by-continent';

describe( 'getTimezonesByContinent()', () => {
	test( "should return null if `timezones` aren't synced", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {},
				rawOffsets: {},
			},
		};

		const byContinent = getTimezonesByContinent( state, 'Atlantic' );
		expect( byContinent ).to.eql( null );
	} );

	test( "should return null if `continent` isn't defined", () => {
		const state = {
			timezones: {
				byContinents: {
					Asia: [ 'Asia/Aqtobe' ],
					America: [ 'America/Blanc-Sablon', 'America/Boa_Vista' ],
					Indian: [ 'Indian/Comoro' ],
				},
				labels: {},
				rawOffsets: {},
			},
		};

		const byContinent = getTimezonesByContinent( state );
		expect( byContinent ).to.eql( null );
	} );

	test( 'should return timezones by contienent object data', () => {
		const state = {
			timezones: {
				byContinents: {
					Asia: [ 'Asia/Aqtobe' ],
					America: [ 'America/Blanc-Sablon', 'America/Boa_Vista' ],
					Indian: [ 'Indian/Comoro' ],
				},
				labels: {},
				rawOffsets: {},
			},
		};

		const byContinent = getTimezonesByContinent( state, 'America' );

		expect( byContinent ).to.eql( [ 'America/Blanc-Sablon', 'America/Boa_Vista' ] );
	} );
} );

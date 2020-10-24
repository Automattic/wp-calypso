/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getTimezonesLabelsByContinent from 'calypso/state/selectors/get-timezones-labels-by-continent';

describe( 'getTimezonesLabelsByContinent()', () => {
	test( "should return null if `timezones` aren't synced", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {},
				rawOffsets: {},
			},
		};

		const labelsByContinent = getTimezonesLabelsByContinent( state, 'Atlantic' );
		expect( labelsByContinent ).to.eql( null );
	} );

	test( "should return null if `continent` isn't defined", () => {
		const state = {
			timezones: {
				byContinents: {
					Asia: [ 'Asia/Aqtobe' ],
					America: [ 'America/Blanc-Sablon', 'America/Boa_Vista' ],
					Indian: [ 'Indian/Comoro' ],
				},
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Blanc-Sablon': 'Blanc-Sablon',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
				rawOffsets: {},
			},
		};

		const labelsByContinent = getTimezonesLabelsByContinent( state );
		expect( labelsByContinent ).to.eql( null );
	} );

	test( 'should return timezones by contienent object data', () => {
		const state = {
			timezones: {
				byContinents: {
					Asia: [ 'Asia/Aqtobe' ],
					America: [ 'America/Blanc-Sablon', 'America/Boa_Vista' ],
					Indian: [ 'Indian/Comoro' ],
				},
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Blanc-Sablon': 'Blanc-Sablon',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
				rawOffsets: {},
			},
		};

		const labelsByContinent = getTimezonesLabelsByContinent( state, 'America' );
		expect( labelsByContinent ).to.eql( {
			'America/Blanc-Sablon': 'Blanc-Sablon',
			'America/Boa_Vista': 'Boa Vista',
		} );
	} );
} );

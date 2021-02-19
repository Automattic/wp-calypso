/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getTimezones from 'calypso/state/selectors/get-timezones';

describe( 'getTimezones()', () => {
	test( "should return [] if `timezones` aren't synced", () => {
		const state = {
			timezones: {
				byContinents: {},
				labels: {},
				rawOffsets: {},
			},
		};

		const timezones = getTimezones( state, 'Atlantic' );
		expect( timezones ).to.eql( [] );
	} );

	test( 'should return timezones array data', () => {
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

		const timezones = getTimezones( state );
		expect( timezones ).to.eql( [
			[ 'Asia', [ [ 'Asia/Aqtobe', 'Aqtobe' ] ] ],

			[
				'America',
				[
					[ 'America/Blanc-Sablon', 'Blanc-Sablon' ],
					[ 'America/Boa_Vista', 'Boa Vista' ],
				],
			],

			[ 'Indian', [ [ 'Indian/Comoro', 'Comoro' ] ] ],
		] );
	} );
} );

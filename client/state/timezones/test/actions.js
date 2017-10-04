/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'state/action-types';

import { requestTimezones, timezonesReceive } from '../actions';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		it( '#requestTimezones()', () => {
			expect( requestTimezones() ).to.eql( {
				type: TIMEZONES_REQUEST,
			} );
		} );

		it( '#timezonesReceive()', () => {
			const responseData = {
				rawOffsets: {
					'UTC+0': 'UTC',
					'UTC+13.75': 'UTC+13:45',
					'UTC+14': 'UTC+14',
				},

				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
				byContinents: {
					Asia: [ 'Asia/Aqtobe' ],
					America: [ 'America/Blanc-Sablon', 'America/Boa_Vista' ],
					Indian: [ 'Indian/Comoro' ],
				},
			};

			expect( timezonesReceive( responseData ) ).to.eql( {
				type: TIMEZONES_RECEIVE,
				...responseData,
			} );
		} );
	} );
} );

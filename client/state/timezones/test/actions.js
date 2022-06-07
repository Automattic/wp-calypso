import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'calypso/state/action-types';
import { requestTimezones, timezonesReceive } from '../actions';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#requestTimezones()', () => {
			expect( requestTimezones() ).toEqual( {
				type: TIMEZONES_REQUEST,
			} );
		} );

		test( '#timezonesReceive()', () => {
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

			expect( timezonesReceive( responseData ) ).toEqual( {
				type: TIMEZONES_RECEIVE,
				...responseData,
			} );
		} );
	} );
} );

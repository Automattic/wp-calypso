/**
 * Internal dependencies
 */
import { addTimezones, fetchTimezones, fromApi } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { timezonesReceive } from 'calypso/state/timezones/actions';

describe( 'timezones request', () => {
	describe( 'successful requests', () => {
		test( 'should dispatch HTTP GET request to /timezones endpoint', () => {
			const action = { type: 'DUMMY' };

			expect( fetchTimezones( action ) ).toEqual(
				expect.objectContaining(
					http(
						{
							apiNamespace: 'wpcom/v2',
							method: 'GET',
							path: '/timezones',
						},
						action
					)
				)
			);
		} );
	} );

	describe( '#addTimezones', () => {
		test( 'should dispatch timezones receive', () => {
			const responseData = {
				manual_utc_offsets: [
					{ value: 'UTC+0', label: 'UTC' },
					{ value: 'UTC+13.75', label: 'UTC+13:45' },
					{ value: 'UTC+14', label: 'UTC+14' },
				],
				timezones: [
					{ value: 'Asia/Aqtobe', label: 'Aqtobe' },
					{ value: 'America/Boa_Vista', label: 'Boa Vista' },
					{ value: 'Indian/Comoro', label: 'Comoro' },
				],
				timezones_by_continent: {
					Asia: [ { value: 'Asia/Aqtobe', label: 'Aqtobe' } ],
					America: [
						{ value: 'America/Blanc-Sablon', label: 'Blanc-Sablon' },
						{ value: 'America/Boa_Vista', label: 'Boa Vista' },
					],
					Indian: [ { value: 'Indian/Comoro', label: 'Comoro' } ],
				},
			};
			const action = timezonesReceive( fromApi( responseData ) );

			expect( addTimezones( action, fromApi( responseData ) ) ).toEqual(
				expect.objectContaining( timezonesReceive( fromApi( responseData ) ) )
			);
		} );
	} );
} );

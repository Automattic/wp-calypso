import {
	applyDeliveryWindowEdit,
	fromUtcDeliveryWindow,
	getDeliveryHourPickerHours,
	getDeliveryWindowOffsetHours,
	getDisplayDeliveryWindow,
	STANDARD_DELIVERY_HOUR_BUCKETS,
	toUtcDeliveryWindow,
	type DeliveryWindow,
} from '../conversion';

describe( 'delivery-window conversion', () => {
	describe( 'getDeliveryWindowOffsetHours', () => {
		it( 'returns null when no timezone is provided', () => {
			expect( getDeliveryWindowOffsetHours( undefined ) ).toBeNull();
		} );

		it( 'returns null for an invalid timezone', () => {
			expect( getDeliveryWindowOffsetHours( 'Not/AZone' ) ).toBeNull();
		} );

		it( 'returns 0 for UTC', () => {
			expect( getDeliveryWindowOffsetHours( 'UTC' ) ).toBe( 0 );
		} );

		it( 'returns a positive offset for a timezone ahead of UTC', () => {
			// Asia/Tokyo has no DST and is always +9.
			expect( getDeliveryWindowOffsetHours( 'Asia/Tokyo' ) ).toBe( 9 );
		} );

		it( 'returns a negative offset for a timezone behind UTC', () => {
			// America/New_York is -5 (EST) or -4 (EDT) depending on the date.
			const winter = getDeliveryWindowOffsetHours(
				'America/New_York',
				new Date( '2026-01-15T12:00:00Z' )
			);
			const summer = getDeliveryWindowOffsetHours(
				'America/New_York',
				new Date( '2026-07-15T12:00:00Z' )
			);
			expect( winter ).toBe( -5 );
			expect( summer ).toBe( -4 );
		} );

		it( 'rounds sub-hour offsets to the nearest whole hour', () => {
			// Asia/Kolkata is +5:30 → rounds to +6 (nearest).
			expect( getDeliveryWindowOffsetHours( 'Asia/Kolkata' ) ).toBe( 6 );
			// Asia/Kathmandu is +5:45 → rounds to +6.
			expect( getDeliveryWindowOffsetHours( 'Asia/Kathmandu' ) ).toBe( 6 );
		} );

		it( 'rounds negative sub-hour offsets away from zero', () => {
			// America/St_Johns is UTC-3:30 in winter → nearest whole hour is -4.
			expect(
				getDeliveryWindowOffsetHours( 'America/St_Johns', new Date( '2026-01-15T12:00:00Z' ) )
			).toBe( -4 );
			// Newfoundland Daylight Time is UTC-2:30 in summer → nearest is -3.
			expect(
				getDeliveryWindowOffsetHours( 'America/St_Johns', new Date( '2026-07-15T12:00:00Z' ) )
			).toBe( -3 );
		} );
	} );

	describe( 'fromUtcDeliveryWindow', () => {
		it( 'is identity when the offset is 0', () => {
			const utc: DeliveryWindow = { hour: 8, day: 3 };
			expect( fromUtcDeliveryWindow( utc, 0 ) ).toEqual( utc );
		} );

		it( 'shifts the hour by the offset without crossing midnight', () => {
			expect( fromUtcDeliveryWindow( { hour: 12, day: 2 }, -4 ) ).toEqual( {
				hour: 8,
				day: 2,
			} );
		} );

		it( 'wraps the day forward when the local hour rolls past midnight', () => {
			// UTC Saturday 22:00 + 4 → Sunday 02:00.
			expect( fromUtcDeliveryWindow( { hour: 22, day: 6 }, 4 ) ).toEqual( {
				hour: 2,
				day: 0,
			} );
		} );

		it( 'wraps the day backward when the local hour rolls before midnight', () => {
			// UTC Sunday 02:00 - 4 → Saturday 22:00.
			expect( fromUtcDeliveryWindow( { hour: 2, day: 0 }, -4 ) ).toEqual( {
				hour: 22,
				day: 6,
			} );
		} );

		it( 'snaps to the nearest lower even-hour bucket', () => {
			// UTC 8:00 + 5 (odd offset, e.g. rounded IST) → 13:00, snapped to 12.
			expect( fromUtcDeliveryWindow( { hour: 8, day: 1 }, 5 ).hour ).toBe( 12 );
		} );
	} );

	describe( 'toUtcDeliveryWindow', () => {
		it( 'is exact (not snapped) so odd offsets keep accurate delivery times', () => {
			// Local Sunday 00:00 in an odd offset (-5) → UTC Sunday 05:00 (odd).
			expect( toUtcDeliveryWindow( { hour: 0, day: 0 }, -5 ) ).toEqual( {
				hour: 5,
				day: 0,
			} );
		} );

		it( 'wraps the day backward across midnight', () => {
			// Local Sunday 00:00 with a +5 offset → UTC Saturday 19:00.
			expect( toUtcDeliveryWindow( { hour: 0, day: 0 }, 5 ) ).toEqual( {
				hour: 19,
				day: 6,
			} );
		} );

		it( 'round-trips the real picker flow local → UTC → local for every bucket', () => {
			// The picker only ever emits even local hours; converting to UTC and
			// back must return the exact same local bucket for any whole offset.
			const offsets = [ -12, -8, -5, -4, -1, 0, 3, 5, 9, 12 ];
			const localHours = [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22 ];
			const days = [ 0, 1, 2, 3, 4, 5, 6 ];

			for ( const offset of offsets ) {
				for ( const hour of localHours ) {
					for ( const day of days ) {
						const local: DeliveryWindow = { hour, day };
						const utc = toUtcDeliveryWindow( local, offset );
						const roundTripped = fromUtcDeliveryWindow( utc, offset );
						expect( roundTripped ).toEqual( local );
					}
				}
			}
		} );
	} );

	describe( 'getDisplayDeliveryWindow', () => {
		it( 'returns raw UTC values without snapping when offset is unknown', () => {
			expect( getDisplayDeliveryWindow( { hour: 5, day: 1 }, null ) ).toEqual( {
				hour: 5,
				day: 1,
			} );
		} );
	} );

	describe( 'applyDeliveryWindowEdit', () => {
		it( 'preserves an odd stored UTC hour when only the day changes in fallback mode', () => {
			expect( applyDeliveryWindowEdit( { hour: 5, day: 1 }, { day: 2 }, null ) ).toEqual( {
				hour: 5,
				day: 2,
			} );
		} );
	} );

	describe( 'getDeliveryHourPickerHours', () => {
		it( 'returns every whole hour in UTC-fallback mode', () => {
			expect( getDeliveryHourPickerHours( 5, true ) ).toEqual(
				Array.from( { length: 24 }, ( _, hour ) => hour )
			);
		} );

		it( 'returns standard even buckets when the display hour is already a bucket', () => {
			expect( getDeliveryHourPickerHours( 8, false ) ).toEqual( STANDARD_DELIVERY_HOUR_BUCKETS );
		} );

		it( 'includes a non-bucket display hour in local-time mode', () => {
			expect( getDeliveryHourPickerHours( 5, false ) ).toEqual( [
				0, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22,
			] );
		} );

		it( 'normalizes display hours before matching options', () => {
			expect( getDeliveryHourPickerHours( 26, false ) ).toEqual( STANDARD_DELIVERY_HOUR_BUCKETS );
			expect( getDeliveryHourPickerHours( 25, true ) ).toContain( 1 );
		} );
	} );
} );

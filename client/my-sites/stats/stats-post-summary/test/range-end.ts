import moment from 'moment';
import { clampRangeEnd, getRangeEndCeiling } from '../range-end';

describe( 'clampRangeEnd', () => {
	test( 'stops an in-progress period at the site today', () => {
		expect( clampRangeEnd( '2026-07-31', moment( '2026-07-02' ), '2026-07-01' ) ).toBe(
			'2026-07-02'
		);
	} );

	test( 'leaves a range that already ends before the site today alone', () => {
		expect( clampRangeEnd( '2026-06-30', moment( '2026-07-02' ), '2026-06-01' ) ).toBe(
			'2026-06-30'
		);
	} );

	test( 'never clamps below the newest charted bucket after a timezone change', () => {
		expect( clampRangeEnd( '2026-07-31', moment( '2026-07-02' ), '2026-07-03' ) ).toBe(
			'2026-07-03'
		);
	} );

	test( 'normalizes a month-granularity bucket to a full date', () => {
		expect( clampRangeEnd( '2026-10-31', moment( '2026-09-30' ), '2026-10' ) ).toBe( '2026-10-01' );
	} );
} );

describe( 'getRangeEndCeiling', () => {
	test( 'falls back to the site today without a newest bucket', () => {
		expect( getRangeEndCeiling( moment( '2026-07-02' ) ) ).toBe( '2026-07-02' );
	} );

	test( 'compares at month granularity when asked', () => {
		const siteToday = moment( '2026-09-30' );
		expect( getRangeEndCeiling( siteToday, '2026-10-01', 'YYYY-MM' ) ).toBe( '2026-10' );
		expect( getRangeEndCeiling( siteToday, '2026-08-01', 'YYYY-MM' ) ).toBe( '2026-09' );
	} );
} );

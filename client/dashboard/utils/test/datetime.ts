import { dateI18n } from '@wordpress/date';
import { parseYmdLocal, formatYmd, formatSiteYmd } from '../datetime';

describe( 'datetime utils (site-time)', () => {
	describe( 'parseYmdLocal', () => {
		it( 'parses valid YYYY-MM-DD to a local Date at midnight', () => {
			const d = parseYmdLocal( '2025-08-13' )!;
			expect( d ).toBeInstanceOf( Date );
			expect( d.getFullYear() ).toBe( 2025 );
			expect( d.getMonth() ).toBe( 7 );
			expect( d.getDate() ).toBe( 13 );
			expect( d.getHours() ).toBe( 0 );
			expect( d.getMinutes() ).toBe( 0 );
		} );

		it.each( [ '2025-13-01', '2025-02-30', '2025-8-1', 'abc' ] )(
			'rejects invalid or malformed dates: %s',
			( s ) => {
				expect( parseYmdLocal( s ) ).toBeNull();
			}
		);

		it( 'accepts leap-day only when valid', () => {
			expect( parseYmdLocal( '2024-02-29' ) ).not.toBeNull();
			expect( parseYmdLocal( '2025-02-29' ) ).toBeNull();
		} );
	} );

	describe( 'formatYmd', () => {
		it( 'uses timezoneString when provided', () => {
			const tz = 'Pacific/Auckland';
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date, tz ) ).toBe( dateI18n( 'Y-m-d', date, tz ) );
		} );

		it( 'falls back to gmtOffset when tz is missing', () => {
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date, undefined, 12 ) ).toMatch( /^\d{4}-\d{2}-\d{2}$/ );
		} );

		it( 'falls back to browser local when neither tz nor offset provided', () => {
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date ) ).toBe( dateI18n( 'Y-m-d', date ) );
		} );

		// Optional DST boundary
		it( 'stays on the same calendar day across DST boundaries (tz path)', () => {
			const tz = 'Europe/London';
			const date = new Date( 2025, 2, 30 );
			expect( formatYmd( date, tz ) ).toBe( dateI18n( 'Y-m-d', date, tz ) );
		} );

		it( 'respects positive offsets across UTC boundary', () => {
			expect( formatYmd( new Date( '2025-09-22T00:30:00Z' ), undefined, 14 ) ).toBe( '2025-09-22' );
			expect( formatYmd( new Date( '2025-09-22T23:30:00Z' ), undefined, 14 ) ).toBe( '2025-09-23' );
		} );

		it( 'respects negative offsets across UTC boundary', () => {
			expect( formatYmd( new Date( '2025-09-22T00:30:00Z' ), undefined, -12 ) ).toBe(
				'2025-09-21'
			);
			expect( formatYmd( new Date( '2025-09-22T23:30:00Z' ), undefined, -12 ) ).toBe(
				'2025-09-22'
			);
		} );
	} );

	describe( 'formatSiteYmd', () => {
		it( 'formatSiteYmd returns the calendar day as-is (no tz math)', () => {
			expect( formatSiteYmd( new Date( 2025, 8, 22 ) ) ).toBe( '2025-09-22' );
		} );
		it( 'preserves the calendar day regardless of time of day', () => {
			expect( formatSiteYmd( new Date( 2025, 8, 22, 0, 0 ) ) ).toBe( '2025-09-22' );
			expect( formatSiteYmd( new Date( 2025, 8, 22, 23, 59 ) ) ).toBe( '2025-09-22' );
		} );

		it( 'produces the same string after parsing with parseYmdLocal', () => {
			const d = new Date( 2025, 8, 22 );
			const ymd = formatSiteYmd( d );
			expect( formatSiteYmd( parseYmdLocal( ymd )! ) ).toBe( ymd );
		} );
		it( 'handles month/year boundaries correctly', () => {
			expect( formatSiteYmd( new Date( 2025, 11, 31 ) ) ).toBe( '2025-12-31' ); // Dec 31
			expect( formatSiteYmd( new Date( 2026, 0, 1 ) ) ).toBe( '2026-01-01' ); // Jan 1
		} );
	} );
} );

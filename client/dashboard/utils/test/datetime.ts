import { dateI18n } from '@wordpress/date';
import { formatLabel } from '../../components/date-range-picker/utils';
import { parseYmdLocal, formatDateWithOffset, formatYmd } from '../datetime';

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

	describe( 'formatLabel (site-time display)', () => {
		it( 'formats using timezone_string when provided', () => {
			const tz = 'Pacific/Auckland';
			const start = new Date( 2025, 7, 13 );
			const end = new Date( 2025, 7, 15 );

			const label = formatLabel( start, end, 'en-US', tz );
			const expected = `${ dateI18n( 'M j, Y', start, tz ) } to ${ dateI18n( 'M j, Y', end, tz ) }`;
			expect( label ).toBe( expected );
		} );

		it( 'falls back to gmt_offset when tz is missing', () => {
			const start = new Date( 2025, 7, 13 );
			const end = new Date( 2025, 7, 15 );
			const gmtOffset = 12;
			const locale = 'en-US';

			const label = formatLabel( start, end, locale, undefined, gmtOffset );
			const left = formatDateWithOffset( start, gmtOffset, locale, { dateStyle: 'medium' } );
			const right = formatDateWithOffset( end, gmtOffset, locale, { dateStyle: 'medium' } );
			expect( label ).toBe( `${ left } to ${ right }` );
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
	} );
} );

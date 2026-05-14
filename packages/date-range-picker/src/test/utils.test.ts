import MockDate from 'mockdate';
import {
	computePresetRange,
	formatLabel,
	getActivePresetId,
	isLast7Days,
	presetDefs,
} from '../utils';

describe( 'utils', () => {
	beforeEach( () => {
		MockDate.set( '2025-08-25T12:00:00Z' );
	} );
	afterEach( () => {
		MockDate.reset();
	} );

	describe( 'computePresetRange', () => {
		const base = new Date( 2025, 7, 25 );

		test( 'today returns the same day for from and to', () => {
			expect( computePresetRange( 'today', base ) ).toEqual( { from: base, to: base } );
		} );

		test( 'yesterday returns previous day for both', () => {
			expect( computePresetRange( 'yesterday', base ) ).toEqual( {
				from: new Date( 2025, 7, 24 ),
				to: new Date( 2025, 7, 24 ),
			} );
		} );

		test.each( [
			[ 'last-7-days', new Date( 2025, 7, 19 ) ],
			[ 'last-30-days', new Date( 2025, 6, 27 ) ],
			[ 'last-90-days', new Date( 2025, 4, 28 ) ],
		] as const )( '%s spans inclusive N-day window', ( id, expectedFrom ) => {
			const range = computePresetRange( id, base );
			expect( range ).toEqual( { from: expectedFrom, to: base } );
		} );

		test( 'last-3-years returns a 3-year window', () => {
			const range = computePresetRange( 'last-3-years', base );
			expect( range?.from.getFullYear() ).toBe( 2022 );
			expect( range?.to ).toEqual( base );
		} );

		test( 'custom returns undefined', () => {
			expect( computePresetRange( 'custom', base ) ).toBeUndefined();
		} );

		test( 'presetDefs includes last-90-days', () => {
			expect( presetDefs.find( ( p ) => p.id === 'last-90-days' ) ).toBeDefined();
		} );
	} );

	describe( 'getActivePresetId', () => {
		const today = new Date( 2025, 7, 25 );

		test( 'identifies today', () => {
			expect( getActivePresetId( today, today, today ) ).toBe( 'today' );
		} );

		test( 'identifies last-7-days', () => {
			expect( getActivePresetId( new Date( 2025, 7, 19 ), today, today ) ).toBe( 'last-7-days' );
		} );

		test( 'identifies last-90-days', () => {
			expect( getActivePresetId( new Date( 2025, 4, 28 ), today, today ) ).toBe( 'last-90-days' );
		} );

		test( 'returns undefined when args are missing', () => {
			expect( getActivePresetId( undefined, today, today ) ).toBeUndefined();
		} );

		test( 'returns undefined for a non-matching custom range', () => {
			expect(
				getActivePresetId( new Date( 2025, 7, 10 ), new Date( 2025, 7, 12 ), today )
			).toBeUndefined();
		} );
	} );

	describe( 'formatLabel', () => {
		const locale = 'en-US';

		test( 'renders start/end without off-by-one', () => {
			const start = new Date( 2025, 7, 19 );
			const end = new Date( 2025, 7, 25 );
			expect( formatLabel( start, end, locale ) ).toBe( 'Aug 19, 2025 to Aug 25, 2025' );
		} );

		test( 'negative offset scenario (site-day inputs) still renders correctly', () => {
			const start = new Date( 2025, 0, 1 );
			const end = new Date( 2025, 0, 2 );
			expect( formatLabel( start, end, locale ) ).toBe( 'Jan 1, 2025 to Jan 2, 2025' );
		} );

		describe( 'DST boundaries (site-day inputs)', () => {
			test( 'spring-forward does not shift calendar days', () => {
				const start = new Date( 2025, 2, 8 ); // Mar 8
				const end = new Date( 2025, 2, 10 ); // Mar 10
				expect( formatLabel( start, end, locale ) ).toBe( 'Mar 8, 2025 to Mar 10, 2025' );
			} );

			test( 'fall-back does not shift calendar days', () => {
				const start = new Date( 2025, 10, 1 ); // Nov 1
				const end = new Date( 2025, 10, 3 ); // Nov 3
				expect( formatLabel( start, end, locale ) ).toBe( 'Nov 1, 2025 to Nov 3, 2025' );
			} );
		} );
	} );

	describe( 'isLast7Days', () => {
		test( 'true for the canonical last-7-days range', () => {
			expect(
				isLast7Days( { start: new Date( 2025, 7, 19 ), end: new Date( 2025, 7, 25 ) } )
			).toBe( true );
		} );

		test( 'false for any other window', () => {
			expect( isLast7Days( { start: new Date( 2025, 7, 1 ), end: new Date( 2025, 7, 10 ) } ) ).toBe(
				false
			);
		} );
	} );
} );

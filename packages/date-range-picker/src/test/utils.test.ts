/**
 * @jest-environment jsdom
 */
import {
	computePresetRange,
	formatLabel,
	getActivePresetId,
	orderRangeBoundaries,
	presetDefs,
} from '../utils';

describe( 'formatLabel', () => {
	const locale = 'en-US';

	test( 'renders start/end without off-by-one', () => {
		const start = new Date( 2025, 7, 19 );
		const end = new Date( 2025, 7, 25 );
		const label = formatLabel( start, end, locale );
		expect( label ).toBe( 'Aug 19, 2025 to Aug 25, 2025' );
	} );

	test( 'negative offset scenario (site-day inputs) still renders correctly', () => {
		// Inputs are already site-day dates; label should be stable
		const start = new Date( 2025, 0, 1 );
		const end = new Date( 2025, 0, 2 );
		const label = formatLabel( start, end, locale );
		expect( label ).toBe( 'Jan 1, 2025 to Jan 2, 2025' );
	} );

	describe( 'DST boundaries (site-day inputs)', () => {
		test( 'spring-forward does not shift calendar days', () => {
			const start = new Date( 2025, 2, 8 ); // Mar 8
			const end = new Date( 2025, 2, 10 ); // Mar 10
			const label = formatLabel( start, end, locale );
			expect( label ).toBe( 'Mar 8, 2025 to Mar 10, 2025' );
		} );

		test( 'fall-back does not shift calendar days', () => {
			const start = new Date( 2025, 10, 1 ); // Nov 1
			const end = new Date( 2025, 10, 3 ); // Nov 3
			const label = formatLabel( start, end, locale );
			expect( label ).toBe( 'Nov 1, 2025 to Nov 3, 2025' );
		} );
	} );
} );

describe( 'last-90-days preset', () => {
	const base = new Date( 2025, 7, 25 );

	test( 'presetDefs includes last-90-days', () => {
		expect( presetDefs.find( ( p ) => p.id === 'last-90-days' ) ).toBeDefined();
	} );

	test( 'computePresetRange spans an inclusive 90-day window ending on baseDate', () => {
		expect( computePresetRange( 'last-90-days', base ) ).toEqual( {
			from: new Date( 2025, 4, 28 ),
			to: base,
		} );
	} );

	test( 'getActivePresetId identifies a 90-day range ending today', () => {
		expect( getActivePresetId( new Date( 2025, 4, 28 ), base, base ) ).toBe( 'last-90-days' );
	} );
} );

describe( 'orderRangeBoundaries', () => {
	const jul3 = new Date( 2026, 6, 3 );
	const jul4 = new Date( 2026, 6, 4 );
	const jul5 = new Date( 2026, 6, 5 );

	test( 'case 1: ordered dates, ordered times — unchanged', () => {
		expect( orderRangeBoundaries( jul3, jul5, '09:00', '17:00' ) ).toEqual( {
			start: jul3,
			end: jul5,
			startTime: '09:00',
			endTime: '17:00',
		} );
	} );

	test( 'case 2: same day, ordered times — unchanged', () => {
		expect( orderRangeBoundaries( jul3, jul3, '09:00', '17:00' ) ).toEqual( {
			start: jul3,
			end: jul3,
			startTime: '09:00',
			endTime: '17:00',
		} );
	} );

	test( 'case 3: same day, equal times — unchanged (single-minute window)', () => {
		expect( orderRangeBoundaries( jul3, jul3, '09:00', '09:00' ) ).toEqual( {
			start: jul3,
			end: jul3,
			startTime: '09:00',
			endTime: '09:00',
		} );
	} );

	test( 'case 4: same day, inverted times — times reordered', () => {
		expect( orderRangeBoundaries( jul3, jul3, '17:00', '09:00' ) ).toEqual( {
			start: jul3,
			end: jul3,
			startTime: '09:00',
			endTime: '17:00',
		} );
	} );

	test( 'case 5: inverted dates, default full-day times — dates swap, times stay on role', () => {
		// The regression guard: 00:00/23:59 must NOT travel with the dates,
		// or the full range collapses to a ~1-minute window.
		expect( orderRangeBoundaries( jul5, jul3, '00:00', '23:59' ) ).toEqual( {
			start: jul3,
			end: jul5,
			startTime: '00:00',
			endTime: '23:59',
		} );
	} );

	test( 'case 6: inverted dates, custom times — dates swap, times stay on role', () => {
		expect( orderRangeBoundaries( jul5, jul3, '09:00', '17:00' ) ).toEqual( {
			start: jul3,
			end: jul5,
			startTime: '09:00',
			endTime: '17:00',
		} );
	} );

	test( 'case 7: cross-day overnight window — left intact (not reordered)', () => {
		expect( orderRangeBoundaries( jul3, jul4, '17:00', '09:00' ) ).toEqual( {
			start: jul3,
			end: jul4,
			startTime: '17:00',
			endTime: '09:00',
		} );
	} );
} );

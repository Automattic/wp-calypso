/**
 * @jest-environment jsdom
 */
import { formatLabel } from '../utils';

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

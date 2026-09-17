import { formatDatumPeriod } from '../format-datum-period';

describe( 'formatDatumPeriod', () => {
	it( 'zero-pads an unpadded month and/or day', () => {
		expect( formatDatumPeriod( new Date( 2026, 6, 6 ) ) ).toBe( '2026-07-06' );
		expect( formatDatumPeriod( new Date( 2026, 0, 8 ) ) ).toBe( '2026-01-08' );
	} );

	it( 'keeps an already double-digit month and day unchanged', () => {
		expect( formatDatumPeriod( new Date( 2026, 11, 28 ) ) ).toBe( '2026-12-28' );
	} );
} );

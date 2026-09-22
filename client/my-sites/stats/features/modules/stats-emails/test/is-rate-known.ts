import { isRateKnown, toCount } from '../is-rate-known';

describe( 'isRateKnown', () => {
	it( 'is known when uniques were attributed', () => {
		expect( isRateKnown( { uniques: 11, totals: 26, sends: 18 } ) ).toBe( true );
	} );

	it( 'is known for a true zero (sent, but no events at all)', () => {
		expect( isRateKnown( { uniques: 0, totals: 0, sends: 18 } ) ).toBe( true );
	} );

	it( 'is unknown when events were recorded but none were attributed', () => {
		expect( isRateKnown( { uniques: 0, totals: 26, sends: 18 } ) ).toBe( false );
	} );

	it( 'is unknown without a denominator, even when uniques exist', () => {
		// Legacy rows can carry engagement while the sends figure is missing;
		// 0/0 is undefined, not 0%.
		expect( isRateKnown( { uniques: 0, totals: 0, sends: 0 } ) ).toBe( false );
		expect( isRateKnown( { uniques: 2, totals: 5, sends: 0 } ) ).toBe( false );
	} );
} );

describe( 'toCount', () => {
	it( 'parses numbers, numeric strings, and treats null/undefined/NaN as 0', () => {
		expect( toCount( 5 ) ).toBe( 5 );
		expect( toCount( '107' ) ).toBe( 107 );
		expect( toCount( null ) ).toBe( 0 );
		expect( toCount( undefined ) ).toBe( 0 );
		expect( toCount( 'abc' ) ).toBe( 0 );
	} );
} );

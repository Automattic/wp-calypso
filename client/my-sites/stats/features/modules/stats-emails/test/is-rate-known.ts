import { calculateClickRate, isRateKnown, toCount } from '../is-rate-known';

describe( 'calculateClickRate', () => {
	it( 'calculates the rate from unique clicks when they are available', () => {
		expect( calculateClickRate( { uniqueClicks: 13, totalClicks: 20, sends: 52 } ) ).toBe( 25 );
	} );

	it( 'preserves fractional precision', () => {
		expect( calculateClickRate( { uniqueClicks: 2, totalClicks: 4, sends: 17 } ) ).toBeCloseTo(
			11.7647
		);
	} );

	it( 'falls back to total clicks when unique attribution is unavailable', () => {
		expect( calculateClickRate( { uniqueClicks: 0, totalClicks: 15, sends: 209 } ) ).toBeCloseTo(
			7.177
		);
		expect(
			calculateClickRate( { uniqueClicks: undefined, totalClicks: 15, sends: 209 } )
		).toBeCloseTo( 7.177 );
	} );

	it( 'returns zero when sends are positive and there are no clicks', () => {
		expect( calculateClickRate( { uniqueClicks: 0, totalClicks: 0, sends: 52 } ) ).toBe( 0 );
	} );

	it( 'returns null without a usable send denominator', () => {
		expect( calculateClickRate( { uniqueClicks: 13, totalClicks: 20, sends: 0 } ) ).toBeNull();
		expect(
			calculateClickRate( { uniqueClicks: 13, totalClicks: 20, sends: undefined } )
		).toBeNull();
	} );
} );

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

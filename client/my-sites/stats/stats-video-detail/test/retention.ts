import { calculatePlayWeightedRetention } from '../retention';

describe( 'calculatePlayWeightedRetention', () => {
	test( 'weights each bucket by its plays', () => {
		const rate = calculatePlayWeightedRetention( [
			{ plays: 10, retentionRate: 80 },
			{ plays: 30, retentionRate: 40 },
		] );

		expect( rate ).toBeCloseTo( ( 10 * 80 + 30 * 40 ) / 40, 10 );
	} );

	test( 'keeps a low-traffic first bucket from skewing the window', () => {
		// One play whose rate the API rounded heavily (true rate ~50%) must not
		// pollute the aggregate the way back-deriving the video duration from
		// that single bucket would.
		const rate = calculatePlayWeightedRetention( [
			{ plays: 1, retentionRate: 33 },
			{ plays: 999, retentionRate: 50 },
		] );

		expect( rate ).toBeCloseTo( 49.983, 3 );
	} );

	test( 'returns the common rate when every bucket matches', () => {
		const rate = calculatePlayWeightedRetention( [
			{ plays: 5, retentionRate: 42.5 },
			{ plays: 500, retentionRate: 42.5 },
		] );

		expect( rate ).toBeCloseTo( 42.5, 10 );
	} );

	test( 'includes zero-retention buckets in the weighting', () => {
		const rate = calculatePlayWeightedRetention( [
			{ plays: 50, retentionRate: 0 },
			{ plays: 50, retentionRate: 60 },
		] );

		expect( rate ).toBe( 30 );
	} );

	test( 'returns 0 when there are no plays', () => {
		expect( calculatePlayWeightedRetention( [] ) ).toBe( 0 );
		expect(
			calculatePlayWeightedRetention( [
				{ plays: 0, retentionRate: 25 },
				{ plays: 0, retentionRate: 75 },
			] )
		).toBe( 0 );
	} );
} );

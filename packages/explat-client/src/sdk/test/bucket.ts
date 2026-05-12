import { getBucketRanges, chooseVariation, inRange } from '../bucket';

describe( 'getBucketRanges', () => {
	it( 'returns an empty array for non-positive variation counts', () => {
		expect( getBucketRanges( 0 ) ).toEqual( [] );
	} );

	it( 'splits two variations evenly at full coverage', () => {
		expect( getBucketRanges( 2 ) ).toEqual( [
			[ 0, 0.5 ],
			[ 0.5, 1 ],
		] );
	} );

	it( 'splits three variations into thirds', () => {
		const r = getBucketRanges( 3 );
		expect( r ).toHaveLength( 3 );
		expect( r[ 0 ][ 0 ] ).toBeCloseTo( 0, 9 );
		expect( r[ 0 ][ 1 ] ).toBeCloseTo( 1 / 3, 9 );
		expect( r[ 1 ][ 0 ] ).toBeCloseTo( 1 / 3, 9 );
		expect( r[ 1 ][ 1 ] ).toBeCloseTo( 2 / 3, 9 );
		expect( r[ 2 ][ 0 ] ).toBeCloseTo( 2 / 3, 9 );
		expect( r[ 2 ][ 1 ] ).toBeCloseTo( 1, 9 );
	} );

	it( 'respects explicit weights that sum to 1', () => {
		expect( getBucketRanges( 2, 1.0, [ 0.7, 0.3 ] ) ).toEqual( [
			[ 0, 0.7 ],
			[ 0.7, 1.0 ],
		] );
	} );

	it( 'caps each range to coverage * weight', () => {
		expect( getBucketRanges( 2, 0.5 ) ).toEqual( [
			[ 0, 0.25 ],
			[ 0.5, 0.75 ],
		] );
	} );

	it( 'falls back to equal split when weights do not sum to 1', () => {
		expect( getBucketRanges( 2, 1.0, [ 0.4, 0.4 ] ) ).toEqual( [
			[ 0, 0.5 ],
			[ 0.5, 1 ],
		] );
	} );

	it( 'falls back to equal split when weights length mismatches', () => {
		expect( getBucketRanges( 2, 1.0, [ 0.7 ] ) ).toEqual( [
			[ 0, 0.5 ],
			[ 0.5, 1 ],
		] );
	} );

	it( 'clamps negative coverage to 0', () => {
		expect( getBucketRanges( 2, -1.0 ) ).toEqual( [
			[ 0, 0 ],
			[ 0.5, 0.5 ],
		] );
	} );

	it( 'clamps coverage above 1 to 1', () => {
		expect( getBucketRanges( 2, 5 ) ).toEqual( [
			[ 0, 0.5 ],
			[ 0.5, 1 ],
		] );
	} );
} );

describe( 'chooseVariation', () => {
	const variations = [
		{ range: [ 0, 0.5 ] as [ number, number ] },
		{ range: [ 0.5, 1 ] as [ number, number ] },
	];

	it( 'picks the first range when n is at the lower bound', () => {
		expect( chooseVariation( 0, variations ) ).toBe( 0 );
	} );

	it( 'picks the second range when n is in it', () => {
		expect( chooseVariation( 0.75, variations ) ).toBe( 1 );
	} );

	it( 'treats lower bound as inclusive (boundary belongs to next range)', () => {
		expect( chooseVariation( 0.5, variations ) ).toBe( 1 );
	} );

	it( 'returns null when n falls outside all ranges (coverage gap)', () => {
		const partial = [
			{ range: [ 0, 0.25 ] as [ number, number ] },
			{ range: [ 0.5, 0.75 ] as [ number, number ] },
		];
		expect( chooseVariation( 0.8, partial ) ).toBeNull();
		expect( chooseVariation( 0.4, partial ) ).toBeNull();
	} );
} );

describe( 'inRange', () => {
	it( 'is inclusive on the lower bound and exclusive on the upper', () => {
		expect( inRange( 0, [ 0, 0.5 ] ) ).toBe( true );
		expect( inRange( 0.49, [ 0, 0.5 ] ) ).toBe( true );
		expect( inRange( 0.5, [ 0, 0.5 ] ) ).toBe( false );
	} );
} );

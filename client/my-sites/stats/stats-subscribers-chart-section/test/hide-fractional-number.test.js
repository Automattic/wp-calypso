import { hideFractionNumber } from '../chart-utils';

describe( 'hideFractionNumber: floor all numbers and replace duplicate with null', () => {
	test( 'should return integers', () => {
		expect( hideFractionNumber( null, [ 1.1, 2.2, 3.5, 8.9, 10 ] ) ).toStrictEqual( [
			1, 2, 3, 8, 10,
		] );
	} );

	test( 'should replace null for consecusive duplicates', () => {
		expect( hideFractionNumber( null, [ 2.2, 2.3, 2.6, 8.9, 10, 10.1, 11 ] ) ).toStrictEqual( [
			2,
			null,
			null,
			8,
			10,
			null,
			11,
		] );
	} );
} );

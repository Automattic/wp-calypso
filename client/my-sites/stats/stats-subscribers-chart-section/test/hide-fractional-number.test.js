import { hideFractionNumber } from '../index';

describe( 'hideFractionNumber: floor all numbers and replace duplicate with null', () => {
	test( 'should return integers', () => {
		expect( hideFractionNumber( [ 1.1, 2.2, 3.5, 8.9, 10 ] ) ).toBe( [ 1, 2, 3, 8, 10 ] );
	} );

	test( 'should replace null for consecusive duplicates', () => {
		expect( [ 2.2, 2.3, 2.6, 8.9, 10, 10.1, 11 ] ).toBe( [ 2, null, null, 8, 10, null, 11 ] );
	} );
} );

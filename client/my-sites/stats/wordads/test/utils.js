import { sortEarningsPeriods, swapYearMonth } from '../utils';

describe( 'sortEarningsPeriods', () => {
	test( 'orders periods by date, most recent first', () => {
		expect( sortEarningsPeriods( [ '2025-10', '2025-06', '2024-09' ] ) ).toEqual( [
			'2025-10',
			'2025-06',
			'2024-09',
		] );
	} );

	test( 'sorts regardless of the input order', () => {
		expect( sortEarningsPeriods( [ '2024-09', '2025-06', '2025-10' ] ) ).toEqual( [
			'2025-10',
			'2025-06',
			'2024-09',
		] );
	} );

	test( 'orders across a year boundary', () => {
		expect( sortEarningsPeriods( [ '2025-12', '2026-01', '2025-11' ] ) ).toEqual( [
			'2026-01',
			'2025-12',
			'2025-11',
		] );
	} );

	test( 'does not mutate the input array', () => {
		const periods = [ '2025-06', '2025-10' ];
		sortEarningsPeriods( periods );
		expect( periods ).toEqual( [ '2025-06', '2025-10' ] );
	} );

	test( 'returns an empty array for no periods', () => {
		expect( sortEarningsPeriods( [] ) ).toEqual( [] );
	} );
} );

describe( 'swapYearMonth', () => {
	test( 'converts a YYYY-MM period into MM-YYYY for display', () => {
		expect( swapYearMonth( '2025-10' ) ).toBe( '10-2025' );
	} );
} );

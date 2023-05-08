import { isPast, calculateDate } from '../subscribers-navigation-arrows';

describe( 'Stats: Subscribers navigation isPast() function', () => {
	test( 'should return false for a future date', () => {
		const futureDate = new Date( '2123-06-01' );
		expect( isPast( futureDate ) ).toBe( false );
	} );

	test( 'should return true for a past date', () => {
		const pastDate = new Date( '2021-06-01' );
		expect( isPast( pastDate ) ).toBe( true );
	} );

	test( 'should return false for the current date', () => {
		const currentDate = new Date();
		expect( isPast( currentDate ) ).toBe( false );
	} );
} );

describe( 'Stats: Subscribers calculateDate() function', () => {
	let date;

	beforeEach( () => {
		date = new Date( '2022-05-20' );
	} );

	test( 'adds days correctly', () => {
		const result = calculateDate( date, 'day', 5 );
		expect( result ).toEqual( new Date( '2022-05-25' ) );
	} );

	test( 'subtracts days correctly', () => {
		const result = calculateDate( date, 'day', -5 );
		expect( result ).toEqual( new Date( '2022-05-15' ) );
	} );

	test( 'adds weeks correctly', () => {
		const result = calculateDate( date, 'week', 2 );
		expect( result ).toEqual( new Date( '2022-06-03' ) );
	} );

	test( 'subtracts weeks correctly', () => {
		const result = calculateDate( date, 'week', -2 );
		expect( result ).toEqual( new Date( '2022-05-06' ) );
	} );

	test( 'adds months correctly', () => {
		const result = calculateDate( date, 'month', 3 );
		expect( result ).toEqual( new Date( '2022-08-20' ) );
	} );

	test( 'subtracts months correctly', () => {
		const result = calculateDate( date, 'month', -3 );
		expect( result ).toEqual( new Date( '2022-02-20' ) );
	} );

	test( 'adds years correctly', () => {
		const result = calculateDate( date, 'year', 1 );
		expect( result ).toEqual( new Date( '2023-05-20' ) );
	} );

	test( 'subtracts years correctly', () => {
		const result = calculateDate( date, 'year', -1 );
		expect( result ).toEqual( new Date( '2021-05-20' ) );
	} );

	test( 'returns the same date when given an unsupported period', () => {
		const result = calculateDate( date, 'hour', 5 );
		expect( result ).toEqual( date );
	} );
} );

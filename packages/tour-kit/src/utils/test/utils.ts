import { classParser } from '../index';

describe( 'classParser function', () => {
	const expected = [ 'class-1', 'class-2', 'class-3' ];

	test( 'accepts null', () => {
		expect( classParser( null ) ).toBeNull();
	} );

	test( 'accepts empty string', () => {
		expect( classParser( '' ) ).toBeNull();
	} );

	test( 'accepts empty array', () => {
		expect( classParser( [] ) ).toBeNull();
	} );

	test( 'accepts a string', () => {
		const string = 'class-1class-2class-3';
		expect( classParser( string ) ).toEqual( [ string ] );
	} );

	test( 'accepts a CSV', () => {
		expect( classParser( 'class-1,class-2,class-3' ) ).toEqual( expected );
	} );

	test( 'accepts an array', () => {
		expect( classParser( expected ) ).toEqual( expected );
	} );

	test( 'accepts array of CSVs', () => {
		const csvArray = [ 'class-1,class-2', 'class-3' ];
		expect( classParser( csvArray ) ).toEqual( expected );
	} );
} );

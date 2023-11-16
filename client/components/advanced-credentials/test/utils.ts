import { checkHostInput, getHostInput } from '../utils';

describe( 'checkHostInput', () => {
	it( 'should return `true` when given a valid URL', () => {
		const host = checkHostInput( 'https://www.example.com/path/to/resource' );
		expect( host ).toEqual( true );
	} );

	it( 'should return `true` when given a valid URL without protocol', () => {
		const host = checkHostInput( 'www.example.com/path/to/resource' );
		expect( host ).toEqual( true );
	} );

	it( 'should return `false` when given an invalid URL', () => {
		const host = checkHostInput( 'not a valid URL' );
		expect( host ).toEqual( false );
	} );

	it( 'should return `false` when given an empty string', () => {
		const host = checkHostInput( '' );
		expect( host ).toEqual( false );
	} );
} );

describe( 'getHostInput', () => {
	it( 'should return the correct host name when given a valid URL', () => {
		const host = getHostInput( 'https://example.com/path/to/resource' );
		expect( host ).toEqual( 'example.com' );
	} );

	it( 'should return the correct host name when given a valid URL without protocol', () => {
		const host = getHostInput( 'www.example.com/path/to/resource' );
		expect( host ).toEqual( 'www.example.com' );
	} );

	it( 'should return empty string given an invalid URL', () => {
		const host = getHostInput( 'not a valid URL' );
		expect( host ).toEqual( '' );
	} );

	it( 'should return empty when given an empty string', () => {
		const host = getHostInput( '' );
		expect( host ).toEqual( '' );
	} );
} );

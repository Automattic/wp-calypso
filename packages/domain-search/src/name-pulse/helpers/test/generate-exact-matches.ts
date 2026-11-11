import { generateExactMatches } from '..';

describe( 'generateExactMatches', () => {
	it( 'strips a matching TLD suffix from the label for that TLD only, keeping at least two characters', () => {
		const rows = generateExactMatches( 'testcom', [ 'blog', 'com' ] );

		expect( rows.find( ( row ) => row.suffix === 'com' )?.domain_name ).toBe( 'test.com' );
		expect( rows.find( ( row ) => row.suffix === 'blog' )?.domain_name ).toBe( 'testcom.blog' );
		expect( generateExactMatches( 'app', [ 'app' ] )[ 0 ].domain_name ).toBe( 'app.app' );
	} );

	it( 'strips the longest matching TLD', () => {
		const rows = generateExactMatches( 'mystudio', [ 'io', 'studio' ] );

		expect( rows.map( ( row ) => row.domain_name ) ).toEqual( [ 'mystudio.io', 'my.studio' ] );
	} );

	it( 'keeps the list order unless asked to promote the matching TLD', () => {
		const tlds = [ 'com', 'net', 'org', 'app' ];

		expect( generateExactMatches( 'myapp', tlds ).map( ( row ) => row.domain_name ) ).toEqual( [
			'myapp.com',
			'myapp.net',
			'myapp.org',
			'my.app',
		] );
		expect(
			generateExactMatches( 'myapp', tlds, { promoteMatchedTld: true } ).map(
				( row ) => row.domain_name
			)
		).toEqual( [ 'myapp.com', 'my.app', 'myapp.net', 'myapp.org' ] );
	} );

	it( 'leaves the order alone when promoting and no TLD matches', () => {
		const rows = generateExactMatches( 'coffee', [ 'com', 'net', 'app' ], {
			promoteMatchedTld: true,
		} );

		expect( rows.map( ( row ) => row.suffix ) ).toEqual( [ 'com', 'net', 'app' ] );
	} );
} );

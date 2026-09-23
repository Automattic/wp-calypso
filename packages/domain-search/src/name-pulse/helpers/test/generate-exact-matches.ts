import { generateExactMatches } from '..';

describe( 'generateExactMatches', () => {
	it( 'strips a matching TLD suffix from the label for that TLD only, keeping at least two characters', () => {
		const rows = generateExactMatches( 'testcom', [ 'blog', 'com' ] );

		expect( rows.find( ( row ) => row.suffix === 'com' )?.domain_name ).toBe( 'test.com' );
		expect( rows.find( ( row ) => row.suffix === 'blog' )?.domain_name ).toBe( 'testcom.blog' );
		expect( generateExactMatches( 'app', [ 'app' ] )[ 0 ].domain_name ).toBe( 'app.app' );
	} );
} );

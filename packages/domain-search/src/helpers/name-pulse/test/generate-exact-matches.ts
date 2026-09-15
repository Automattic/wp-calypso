import { generateExactMatches, NAME_PULSE_TLDS, NamePulseDomainStatus } from '..';

describe( 'generateExactMatches', () => {
	it( 'generates one WAITING row per TLD in list order', () => {
		const rows = generateExactMatches( 'test', [ 'blog', 'com', 'net' ] );

		expect( rows.map( ( row ) => row.domain_name ) ).toEqual( [
			'test.blog',
			'test.com',
			'test.net',
		] );
		expect( rows[ 0 ] ).toEqual( {
			domain_name: 'test.blog',
			suffix: 'blog',
			status: NamePulseDomainStatus.WAITING,
			source: 'exact',
		} );
	} );

	it( 'defaults to the full TLD constant', () => {
		expect( generateExactMatches( 'coffee' ) ).toHaveLength( NAME_PULSE_TLDS.length );
	} );

	it( 'strips a matching TLD suffix from the label for that TLD only', () => {
		const rows = generateExactMatches( 'testcom', [ 'blog', 'com' ] );

		expect( rows.find( ( row ) => row.suffix === 'com' )?.domain_name ).toBe( 'test.com' );
		expect( rows.find( ( row ) => row.suffix === 'blog' )?.domain_name ).toBe( 'testcom.blog' );
	} );

	it( 'does not strip when fewer than two characters would remain', () => {
		const rows = generateExactMatches( 'app', [ 'app' ] );

		expect( rows[ 0 ].domain_name ).toBe( 'app.app' );
	} );
} );

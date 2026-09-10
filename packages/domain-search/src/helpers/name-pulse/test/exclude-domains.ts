import {
	excludeDomains,
	toDomainNameSet,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
} from '..';

const row = ( domain_name: string ): NamePulseDomainResult => ( {
	domain_name,
	suffix: domain_name.slice( domain_name.indexOf( '.' ) + 1 ),
	status: NamePulseDomainStatus.AVAILABLE,
	source: 'keyword',
} );

describe( 'excludeDomains', () => {
	it( 'removes rows whose domain is in the excluded set', () => {
		const results = [ row( 'coffee.com' ), row( 'coffeeshop.com' ), row( 'coffee.net' ) ];

		expect(
			excludeDomains( results, new Set( [ 'coffeeshop.com' ] ) ).map( ( r ) => r.domain_name )
		).toEqual( [ 'coffee.com', 'coffee.net' ] );
	} );

	it( 'returns the same array when nothing is excluded', () => {
		const results = [ row( 'coffee.com' ) ];

		expect( excludeDomains( results, new Set() ) ).toBe( results );
		expect( excludeDomains( results, new Set( [ 'other.com' ] ) ) ).toBe( results );
	} );

	it( 'returns the same empty array for empty input', () => {
		const results: NamePulseDomainResult[] = [];

		expect( excludeDomains( results, new Set( [ 'coffee.com' ] ) ) ).toBe( results );
	} );
} );

describe( 'toDomainNameSet', () => {
	it( 'collects domain names across lists', () => {
		const set = toDomainNameSet( [ row( 'a.com' ) ], [ row( 'b.com' ), row( 'a.com' ) ] );

		expect( Array.from( set ) ).toEqual( [ 'a.com', 'b.com' ] );
	} );
} );

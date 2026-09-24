import {
	getAiTopResults,
	getTopResults,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseSource,
} from '..';

const row = (
	domain_name: string,
	status: NamePulseDomainStatus = NamePulseDomainStatus.AVAILABLE
): NamePulseDomainResult => ( {
	domain_name,
	suffix: domain_name.slice( domain_name.indexOf( '.' ) + 1 ),
	status,
	source: 'exact',
} );

const suggestion = (
	domain_name: string,
	raw_price: number,
	source: NamePulseSource = 'keyword',
	status: NamePulseDomainStatus = NamePulseDomainStatus.AVAILABLE
): NamePulseDomainResult => ( { ...row( domain_name, status ), raw_price, source } );

describe( 'getTopResults', () => {
	it( 'features at most three rows, in list order, that are available or waiting', () => {
		const rows = [
			row( 'test.blog', NamePulseDomainStatus.WAITING ),
			row( 'test.com', NamePulseDomainStatus.TAKEN ),
			row( 'test.org' ),
			row( 'test.net' ),
			row( 'test.app' ),
		];

		expect( getTopResults( rows ).map( ( r ) => r.domain_name ) ).toEqual( [
			'test.blog',
			'test.org',
			'test.net',
		] );
	} );

	it( 'keeps a row taken by the cart check in its slot', () => {
		const rows = [
			{ ...row( 'test.blog', NamePulseDomainStatus.TAKEN ), is_cart_check: true },
			row( 'test.com' ),
			row( 'test.app' ),
			row( 'test.dev' ),
		];

		expect( getTopResults( rows ).map( ( r ) => r.domain_name ) ).toEqual( [
			'test.blog',
			'test.com',
			'test.app',
		] );
	} );

	it( 'drops a row taken by a real-time check the reader never asked for', () => {
		const rows = [
			{ ...row( 'test.blog', NamePulseDomainStatus.TAKEN ), is_realtime: true },
			row( 'test.com' ),
			row( 'test.org' ),
			row( 'test.app' ),
		];

		expect( getTopResults( rows ).map( ( r ) => r.domain_name ) ).toEqual( [
			'test.com',
			'test.org',
			'test.app',
		] );
	} );
} );

describe( 'getAiTopResults', () => {
	it( 'features the three cheapest available suggestions, ties broken by name', () => {
		const keyword = [
			suggestion( 'zebra.blog', 12 ),
			suggestion( 'taken.com', 8, 'keyword', NamePulseDomainStatus.TAKEN ),
			suggestion( 'apple.blog', 12 ),
			suggestion( 'pricey.com', 40 ),
		];
		const creative = [
			suggestion( 'cheapest.dev', 4, 'ai' ),
			suggestion( 'middling.app', 20, 'ai' ),
		];

		expect( getAiTopResults( keyword, creative ).map( ( r ) => r.domain_name ) ).toEqual( [
			'cheapest.dev',
			'apple.blog',
			'zebra.blog',
		] );
	} );

	it( 'keeps the first copy of a domain both lists return', () => {
		const shared = getAiTopResults(
			[ suggestion( 'scoops.blog', 22 ) ],
			[ suggestion( 'scoops.blog', 22, 'ai' ) ]
		);

		expect( shared ).toHaveLength( 1 );
		expect( shared[ 0 ].source ).toBe( 'keyword' );
	} );

	it( 'sorts rows with no price last', () => {
		expect(
			getAiTopResults( [ row( 'unpriced.com' ), suggestion( 'priced.com', 30 ) ] ).map(
				( r ) => r.domain_name
			)
		).toEqual( [ 'priced.com', 'unpriced.com' ] );
	} );
} );

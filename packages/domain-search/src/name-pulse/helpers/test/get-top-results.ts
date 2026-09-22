import {
	calculateTopTlds,
	getTopResults,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
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

describe( 'calculateTopTlds', () => {
	it( 'promotes a TLD matched in the label to the second slot without duplicating a default', () => {
		const tlds = [ 'blog', 'com', 'org', 'net', 'app', 'dev' ];

		expect( calculateTopTlds( 'testorg', tlds ) ).toEqual( [ 'blog', 'org', 'com', 'app' ] );
		expect( calculateTopTlds( 'testcom', tlds ) ).toEqual( [ 'blog', 'com', 'app', 'dev' ] );
	} );
} );

describe( 'getTopResults', () => {
	it( 'features at most three rows, preferring top TLDs that are available or waiting', () => {
		const rows = [
			row( 'test.net' ),
			row( 'test.com', NamePulseDomainStatus.TAKEN ),
			row( 'test.blog', NamePulseDomainStatus.WAITING ),
			row( 'test.app' ),
		];

		expect(
			getTopResults( rows, [ 'blog', 'com', 'app', 'dev' ] ).map( ( r ) => r.domain_name )
		).toEqual( [ 'test.blog', 'test.app', 'test.net' ] );
	} );

	it( 'keeps a row taken by a real-time check in its slot', () => {
		const rows = [
			{ ...row( 'test.blog', NamePulseDomainStatus.TAKEN ), is_realtime: true },
			row( 'test.com' ),
			row( 'test.app' ),
			row( 'test.dev' ),
		];

		expect(
			getTopResults( rows, [ 'blog', 'com', 'app', 'dev' ] ).map( ( r ) => r.domain_name )
		).toEqual( [ 'test.blog', 'test.com', 'test.app' ] );
	} );
} );

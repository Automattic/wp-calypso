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
} );

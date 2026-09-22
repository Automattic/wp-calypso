import { getTopResults, NamePulseDomainStatus, type NamePulseDomainResult } from '..';

const row = (
	domain_name: string,
	status: NamePulseDomainStatus = NamePulseDomainStatus.AVAILABLE
): NamePulseDomainResult => ( {
	domain_name,
	suffix: domain_name.slice( domain_name.indexOf( '.' ) + 1 ),
	status,
	source: 'exact',
} );

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

	it( 'keeps a row taken by a real-time check in its slot', () => {
		const rows = [
			{ ...row( 'test.blog', NamePulseDomainStatus.TAKEN ), is_realtime: true },
			row( 'test.com' ),
			row( 'test.org' ),
			row( 'test.app' ),
		];

		expect( getTopResults( rows ).map( ( r ) => r.domain_name ) ).toEqual( [
			'test.blog',
			'test.com',
			'test.org',
		] );
	} );
} );

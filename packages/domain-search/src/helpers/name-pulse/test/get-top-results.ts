import {
	calculateTopTlds,
	getTopResults,
	NAME_PULSE_TOP_RESULTS_TLDS,
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

const toMap = ( rows: NamePulseDomainResult[] ) =>
	new Map( rows.map( ( r ) => [ r.domain_name, r ] ) );

describe( 'calculateTopTlds', () => {
	it( 'returns the defaults when the label ends with no TLD', () => {
		expect( calculateTopTlds( 'example' ) ).toEqual( [ ...NAME_PULSE_TOP_RESULTS_TLDS ] );
	} );

	it( 'promotes a matched TLD to the second slot and keeps four entries', () => {
		expect( calculateTopTlds( 'testorg' ) ).toEqual( [ 'blog', 'org', 'com', 'app' ] );
	} );

	it( 'does not duplicate a matched TLD already in the defaults', () => {
		expect( calculateTopTlds( 'testcom' ) ).toEqual( [ 'blog', 'com', 'app', 'dev' ] );
	} );

	it( 'leaves the defaults alone when the match is blog', () => {
		expect( calculateTopTlds( 'exampleblog' ) ).toEqual( [ ...NAME_PULSE_TOP_RESULTS_TLDS ] );
	} );
} );

describe( 'getTopResults', () => {
	const topTlds = [ 'blog', 'com', 'app', 'dev' ];

	it( 'returns at most `count` results', () => {
		const map = toMap( [
			row( 'test.com' ),
			row( 'test.blog' ),
			row( 'test.app' ),
			row( 'test.dev' ),
		] );

		expect( getTopResults( map, topTlds ) ).toHaveLength( 3 );
		expect( getTopResults( map, topTlds, 2 ) ).toHaveLength( 2 );
	} );

	it( 'prefers top TLDs that are available or waiting', () => {
		const map = toMap( [
			row( 'test.net' ),
			row( 'test.com', NamePulseDomainStatus.TAKEN ),
			row( 'test.blog', NamePulseDomainStatus.WAITING ),
			row( 'test.app' ),
		] );

		expect( getTopResults( map, topTlds ).map( ( r ) => r.domain_name ) ).toEqual( [
			'test.blog',
			'test.app',
			'test.net',
		] );
	} );

	it( 'skips taken domains entirely', () => {
		const map = toMap( [
			row( 'test.com', NamePulseDomainStatus.TAKEN ),
			row( 'test.net', NamePulseDomainStatus.TAKEN ),
		] );

		expect( getTopResults( map, topTlds ) ).toEqual( [] );
	} );

	it( 'never returns the same domain twice', () => {
		const map = toMap( [ row( 'test.com' ) ] );

		expect( getTopResults( map, topTlds ) ).toHaveLength( 1 );
	} );
} );

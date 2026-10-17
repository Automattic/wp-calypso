import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import {
	siteBackupKnownThreatsQuery,
	siteBackupsKnownThreatsQuery,
	siteBackupThreatsQuery,
} from '../site-backup-known-threats';

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 123;
const LIST_PATH = `/wpcom/v3/sites/${ SITE_ID }/rewind/backups`;

const counts = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

const backup = ( period: string | number, knownThreats?: ReturnType< typeof counts > ) => ( {
	status: 'finished',
	is_rewindable: true,
	summary: '',
	object: {
		backup_period: period,
		...( knownThreats ? { known_threats: knownThreats } : {} ),
	},
} );

const page = ( page: number, totalPages: number, backups: unknown[], extra = {} ) => ( {
	ok: true,
	totalItems: 0,
	totalPages,
	page,
	itemsPerPage: 100,
	backups,
	...extra,
} );

const mockPage = ( n: number, body: unknown ) =>
	nock( BASE ).get( LIST_PATH ).query( { number: 100, page: n } ).reply( 200, body );

const run = ( rewindId: string ) =>
	new QueryClient( { defaultOptions: { queries: { retry: false } } } ).fetchQuery(
		siteBackupKnownThreatsQuery( SITE_ID, rewindId )
	);

describe( 'site backup known threats queries', () => {
	afterEach( () => nock.cleanAll() );

	it( 'maps a page of backups by period', async () => {
		const scope = mockPage(
			1,
			page( 1, 1, [ backup( '300', counts( 2 ) ), backup( 200 ), backup( '100', counts( 0 ) ) ], {
				latest_without_known_threats: 200,
			} )
		);
		const client = new QueryClient();
		const result = await client.fetchQuery( siteBackupsKnownThreatsQuery( SITE_ID ) );

		expect( scope.isDone() ).toBe( true );
		expect( result ).toEqual( {
			byPeriod: { 300: counts( 2 ), 100: counts( 0 ) },
			periods: [ 300, 200, 100 ],
			latestWithoutKnownThreats: 200,
			oldestPeriod: 100,
			totalPages: 1,
		} );
	} );

	it( 'pages until the backup is found', async () => {
		const first = mockPage( 1, page( 1, 3, [ backup( '300', counts( 1 ) ) ] ) );
		const second = mockPage( 2, page( 2, 3, [ backup( '200', counts( 4 ) ) ] ) );

		const result = await run( '200' );

		expect( first.isDone() ).toBe( true );
		expect( second.isDone() ).toBe( true );
		expect( result.knownThreats ).toEqual( counts( 4 ) );
	} );

	it( 'stops paging once past the period', async () => {
		const first = mockPage( 1, page( 1, 3, [ backup( '300', counts( 1 ) ), backup( '150' ) ] ) );

		const result = await run( '200' );

		expect( first.isDone() ).toBe( true );
		expect( result.knownThreats ).toBeNull();
	} );

	it( 'stops after 30 pages', async () => {
		let requests = 0;
		nock( BASE )
			.persist()
			.get( LIST_PATH )
			.query( true )
			.reply( 200, () => {
				requests++;
				return page( requests, 50, [ backup( String( 10000 - requests ), counts( 1 ) ) ] );
			} );

		const result = await run( '1' );

		expect( requests ).toBe( 30 );
		expect( result.knownThreats ).toBeNull();
	} );

	it( 'matches dotted rewind ids', async () => {
		mockPage( 1, page( 1, 1, [ backup( '1792244294', counts( 3 ) ) ] ) );

		const result = await run( '1792244294.123' );

		expect( result.knownThreats ).toEqual( counts( 3 ) );
	} );

	it( 'uses the containing backup for a realtime rewind id', async () => {
		mockPage( 1, page( 1, 1, [ backup( '300', counts( 1 ) ), backup( '200', counts( 2 ) ) ] ) );

		const result = await run( '250.123' );

		expect( result.knownThreats ).toEqual( counts( 2 ) );
	} );

	it( 'pages to the containing backup when it is on a later page', async () => {
		const first = mockPage( 1, page( 1, 3, [ backup( '300', counts( 1 ) ) ] ) );
		const second = mockPage( 2, page( 2, 3, [ backup( '200', counts( 4 ) ) ] ) );

		const result = await run( '250' );

		expect( first.isDone() ).toBe( true );
		expect( second.isDone() ).toBe( true );
		expect( result.knownThreats ).toEqual( counts( 4 ) );
	} );

	it( 'stops paging once a page reaches the period', async () => {
		const first = mockPage( 1, page( 1, 3, [ backup( '300', counts( 1 ) ), backup( '200' ) ] ) );

		const result = await run( '200' );

		expect( first.isDone() ).toBe( true );
		expect( nock.pendingMocks() ).toEqual( [] );
		expect( result.knownThreats ).toBeNull();
	} );

	it( 'returns null for a rewind id older than every backup', async () => {
		mockPage( 1, page( 1, 2, [ backup( '300', counts( 1 ) ) ] ) );
		mockPage( 2, page( 2, 2, [ backup( '200', counts( 2 ) ) ] ) );

		const result = await run( '100' );

		expect( nock.pendingMocks() ).toEqual( [] );
		expect( result.knownThreats ).toBeNull();
	} );

	it( 'returns null when the containing backup has no known threats', async () => {
		mockPage( 1, page( 1, 1, [ backup( '300', counts( 1 ) ), backup( '200' ) ] ) );

		const result = await run( '250' );

		expect( result.knownThreats ).toBeNull();
	} );

	it.each( [ '', '0', '-5', 'abc' ] )(
		'makes no request for the invalid rewind id %p',
		async ( rewindId ) => {
			const scope = nock( BASE )
				.get( LIST_PATH )
				.query( true )
				.reply( 200, page( 1, 1, [] ) );

			const result = await run( rewindId );

			expect( scope.isDone() ).toBe( false );
			expect( result ).toEqual( { knownThreats: null, latestWithoutKnownThreats: null } );
		}
	);

	it( 'returns null counts before VaultPress ships', async () => {
		mockPage( 1, page( 1, 1, [ backup( '300' ), backup( '200' ) ] ) );

		const result = await run( '200' );

		expect( result ).toEqual( { knownThreats: null, latestWithoutKnownThreats: null } );
	} );

	it( 'takes latestWithoutKnownThreats from page 1', async () => {
		mockPage(
			1,
			page( 1, 2, [ backup( '300', counts( 1 ) ) ], { latest_without_known_threats: 250 } )
		);
		mockPage( 2, page( 2, 2, [ backup( '200', counts( 2 ) ) ] ) );

		const result = await run( '200' );

		expect( result ).toEqual( { knownThreats: counts( 2 ), latestWithoutKnownThreats: 250 } );
	} );

	it( 'caches per-backup counts within the stale window', async () => {
		const scope = mockPage( 1, page( 1, 1, [ backup( '200', counts( 2 ) ) ] ) );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		const first = await client.fetchQuery( siteBackupKnownThreatsQuery( SITE_ID, '200' ) );
		const second = await client.fetchQuery( siteBackupKnownThreatsQuery( SITE_ID, '200' ) );

		expect( scope.isDone() ).toBe( true );
		expect( nock.pendingMocks() ).toEqual( [] );
		expect( second ).toEqual( first );
	} );

	it( 'shares page 1 between the list and per-backup queries', async () => {
		let requests = 0;
		nock( BASE )
			.persist()
			.get( LIST_PATH )
			.query( { number: 100, page: 1 } )
			.reply( 200, () => {
				requests++;
				return page( 1, 2, [ backup( '300', counts( 1 ) ), backup( '200', counts( 2 ) ) ] );
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		await client.fetchQuery( siteBackupsKnownThreatsQuery( SITE_ID ) );
		const result = await client.fetchQuery( siteBackupKnownThreatsQuery( SITE_ID, '250' ) );

		expect( requests ).toBe( 1 );
		expect( result.knownThreats ).toEqual( counts( 2 ) );
	} );

	it( 'fetches each page once across per-backup queries', async () => {
		let requests = 0;
		nock( BASE )
			.persist()
			.get( LIST_PATH )
			.query( true )
			.reply( 200, ( uri ) => {
				requests++;
				return uri.includes( 'page=1' )
					? page( 1, 2, [ backup( '300', counts( 1 ) ) ] )
					: page( 2, 2, [ backup( '200', counts( 2 ) ) ] );
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		await client.fetchQuery( siteBackupKnownThreatsQuery( SITE_ID, '310' ) );
		await client.fetchQuery( siteBackupKnownThreatsQuery( SITE_ID, '250' ) );

		expect( requests ).toBe( 2 );
	} );

	it( "fetches one backup's threats", async () => {
		const body = {
			backup_id: 1792244294,
			cutoff: null,
			summary: counts( 1 ),
			count: 0,
			truncated: false,
			threats: [],
		};
		const scope = nock( BASE )
			.get( `/wpcom/v2/sites/${ SITE_ID }/rewind/backups/1792244294/threats` )
			.reply( 200, body );

		const result = await new QueryClient().fetchQuery(
			siteBackupThreatsQuery( SITE_ID, '1792244294' )
		);

		expect( scope.isDone() ).toBe( true );
		expect( result ).toEqual( body );
	} );
} );

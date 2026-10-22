import nock from 'nock';
import { initiateSiteBackupRestore, initiateSiteGranularRestore } from '..';

const BASE = 'https://public-api.wordpress.com';
const PATH = '/rest/v1/activity-log/123/rewind/to/1792244435.274';
const config = { themes: true, sqls: true };

describe( 'initiateSiteBackupRestore', () => {
	afterEach( () => nock.cleanAll() );

	it( 'always sends acknowledge_threats, true only when acknowledged', async () => {
		const bodies: Record< string, unknown >[] = [];
		const scope = nock( BASE )
			.post( PATH, ( body ) => {
				bodies.push( body );
				return true;
			} )
			.times( 3 )
			.reply( 200, { restore_id: '42' } );

		await expect(
			initiateSiteBackupRestore( 123, '1792244435.274', 'test', config, true )
		).resolves.toBe( 42 );
		await initiateSiteBackupRestore( 123, '1792244435.274', 'test', config, false );
		await initiateSiteBackupRestore( 123, '1792244435.274', 'test', config );

		expect( scope.isDone() ).toBe( true );
		expect( bodies[ 0 ] ).toEqual( {
			types: config,
			calypso_env: 'test',
			force_rewind: true,
			acknowledge_threats: true,
		} );
		expect( bodies[ 1 ].acknowledge_threats ).toBe( false );
		expect( bodies[ 2 ].acknowledge_threats ).toBe( false );
		expect( bodies[ 2 ] ).toEqual( {
			types: config,
			calypso_env: 'test',
			force_rewind: true,
			acknowledge_threats: false,
		} );
	} );
} );

describe( 'initiateSiteGranularRestore', () => {
	afterEach( () => nock.cleanAll() );

	it( 'always sends acknowledge_threats, true only when acknowledged', async () => {
		const bodies: Record< string, unknown >[] = [];
		const scope = nock( BASE )
			.post( PATH, ( body ) => {
				bodies.push( body );
				return true;
			} )
			.times( 3 )
			.reply( 200, { restore_id: '42' } );
		const granularConfig = { includePaths: 'f1,f2' };

		await expect(
			initiateSiteGranularRestore( 123, '1792244435.274', 'test', granularConfig, true )
		).resolves.toBe( 42 );
		await initiateSiteGranularRestore( 123, '1792244435.274', 'test', granularConfig, false );
		await initiateSiteGranularRestore( 123, '1792244435.274', 'test', granularConfig );

		expect( scope.isDone() ).toBe( true );
		expect( bodies[ 0 ] ).toEqual( {
			types: 'paths',
			include_path_list: 'f1,f2',
			calypso_env: 'test',
			force_rewind: true,
			acknowledge_threats: true,
		} );
		expect( bodies[ 1 ].acknowledge_threats ).toBe( false );
		expect( bodies[ 2 ] ).toEqual( {
			types: 'paths',
			include_path_list: 'f1,f2',
			calypso_env: 'test',
			force_rewind: true,
			acknowledge_threats: false,
		} );
	} );
} );

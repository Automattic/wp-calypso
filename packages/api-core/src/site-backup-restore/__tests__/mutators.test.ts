import nock from 'nock';
import { initiateSiteBackupRestore } from '..';

const BASE = 'https://public-api.wordpress.com';
const PATH = '/rest/v1/activity-log/123/rewind/to/1792244435.274';
const config = { themes: true, sqls: true };

describe( 'initiateSiteBackupRestore', () => {
	afterEach( () => nock.cleanAll() );

	it( 'sends acknowledge_threats only when acknowledged', async () => {
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
		expect( bodies[ 1 ] ).not.toHaveProperty( 'acknowledge_threats' );
		expect( bodies[ 2 ] ).not.toHaveProperty( 'acknowledge_threats' );
		expect( bodies[ 2 ] ).toEqual( { types: config, calypso_env: 'test', force_rewind: true } );
	} );
} );

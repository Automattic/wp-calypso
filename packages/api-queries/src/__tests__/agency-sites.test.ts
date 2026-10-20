/**
 * @jest-environment jsdom
 */

import nock from 'nock';
import { agencySitesImportMutation } from '../agency-sites';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function importSites( blogIds: number[] ) {
	const { mutationFn } = agencySitesImportMutation( AGENCY_ID );
	return mutationFn!( blogIds );
}

function mockImport( blogId: number, status: number, body: unknown ) {
	return nock( BASE )
		.post( `/wpcom/v2/agency/${ AGENCY_ID }/sites`, { blog_id: blogId } )
		.reply( status, body );
}

afterEach( () => nock.cleanAll() );

describe( 'agencySitesImportMutation', () => {
	it( 'reports every site when all of them import', async () => {
		mockImport( 1, 200, { success: true } );
		mockImport( 2, 200, { success: true } );

		await expect( importSites( [ 1, 2 ] ) ).resolves.toEqual( {
			imported: [ 1, 2 ],
			failed: [],
		} );
	} );

	it( 'keeps the sites that imported when one request fails', async () => {
		mockImport( 1, 200, { success: true } );
		mockImport( 2, 500, { message: 'Nope' } );

		await expect( importSites( [ 1, 2 ] ) ).resolves.toEqual( {
			imported: [ 1 ],
			failed: [ 2 ],
		} );
	} );

	it( 'treats a 200 that did not succeed as a failure', async () => {
		mockImport( 1, 200, { success: true } );
		mockImport( 2, 200, { success: false } );

		await expect( importSites( [ 1, 2 ] ) ).resolves.toEqual( {
			imported: [ 1 ],
			failed: [ 2 ],
		} );
	} );

	it( 'rejects when nothing imported', async () => {
		mockImport( 1, 500, { message: 'Nope' } );
		mockImport( 2, 500, { message: 'Nope' } );

		await expect( importSites( [ 1, 2 ] ) ).rejects.toBeTruthy();
	} );
} );

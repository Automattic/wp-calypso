jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { resolveSelect: jest.fn() } ) );

import { resolveSelect } from '@wordpress/data';
import { readRecord } from '../read-record';

const serve = ( outcome: Promise< unknown > ) =>
	( resolveSelect as jest.Mock ).mockReturnValue( { getEditedEntityRecord: () => outcome } );

it( 'returns the record', async () => {
	serve( Promise.resolve( { id: 7 } ) );

	await expect( readRecord( 'postType', 'page', 7 ) ).resolves.toEqual( { id: 7 } );
} );

// The store rejects a missing record rather than returning nothing.
it.each( [
	{ case: 'a 404', error: { data: { status: 404 } } },
	{ case: 'an invalid post id', error: { code: 'rest_post_invalid_id' } },
] )( 'reads $case as no record', async ( { error } ) => {
	serve( Promise.reject( error ) );

	await expect( readRecord( 'postType', 'page', 7 ) ).resolves.toBeNull();
} );

it( 'rethrows any other failure', async () => {
	serve( Promise.reject( new Error( 'offline' ) ) );

	await expect( readRecord( 'postType', 'page', 7 ) ).rejects.toThrow( 'offline' );
} );

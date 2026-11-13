/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
vi.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
vi.mock( '@wordpress/data', () => ( { resolveSelect: vi.fn() } ) );

import { resolveSelect } from '@wordpress/data';
import { readRecord } from '../read-record';

const getEditedEntityRecord = vi.fn();

beforeEach( () => {
	vi.clearAllMocks();
	( resolveSelect as Mock ).mockReturnValue( { getEditedEntityRecord } );
} );

it( 'returns the record', async () => {
	getEditedEntityRecord.mockResolvedValue( { id: 7 } );

	await expect( readRecord( 'postType', 'page', 7 ) ).resolves.toEqual( { id: 7 } );
	expect( getEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 7 );
} );

it( 'reads an unresolved record as no record', async () => {
	getEditedEntityRecord.mockResolvedValue( false );

	await expect( readRecord( 'postType', 'page', 7 ) ).resolves.toBeNull();
} );

// The store rejects a missing record rather than returning nothing.
it.each( [
	{ case: 'a 404', error: { data: { status: 404 } } },
	{ case: 'an invalid post id', error: { code: 'rest_post_invalid_id' } },
] )( 'reads $case as no record', async ( { error } ) => {
	getEditedEntityRecord.mockRejectedValue( error );

	await expect( readRecord( 'postType', 'page', 7 ) ).resolves.toBeNull();
} );

it( 'rethrows any other failure', async () => {
	getEditedEntityRecord.mockRejectedValue( new Error( 'offline' ) );

	await expect( readRecord( 'postType', 'page', 7 ) ).rejects.toThrow( 'offline' );
} );

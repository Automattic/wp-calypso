/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-config' );

describe( 'useMigrationCancellation', () => {
	beforeEach( () => {
		nock.disableNetConnect();
	} );

	it( 'cancels the migration', async () => {
		nock( 'https://public-api.wordpress.com' )
			.delete( '/wpcom/v2/sites/123/site-migration-status-sticker', {
				type: 'pending',
			} )
			.reply( 200, { success: true } );

		const { result } = renderHookWithProvider( () => useMigrationCancellation( 123 ) );

		result.current.mutate();

		await waitFor( () => {
			expect( nock.isDone() ).toBe( true );
			expect( result.current.data ).toEqual( { status: 'success' } );
		} );
	} );
} );

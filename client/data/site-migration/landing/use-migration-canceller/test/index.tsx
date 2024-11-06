/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import nock from 'nock';
import { useMigrationCanceller } from 'calypso/data/site-migration/landing/use-migration-canceller';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-config' );

describe( 'useMigrationCanceller', () => {
	beforeEach( () => {
		when( isEnabled ).calledWith( 'automated-migration/pending-status' ).mockReturnValue( true );
		nock.disableNetConnect();
	} );

	it( 'updates the migration status to started', async () => {
		nock( 'https://public-api.wordpress.com' )
			.delete( '/wpcom/v2/sites/123/site-migration-status-sticker', {
				type: 'pending',
			} )
			.reply( 200, { success: true } );

		const { result } = renderHookWithProvider( () => useMigrationCanceller( 123 ) );

		result.current.mutate();

		await waitFor( () => {
			expect( nock.isDone() ).toBe( true );
			expect( result.current.data ).toEqual( { status: 'success' } );
		} );
	} );

	it( 'skips the status update when the feature is off', async () => {
		when( isEnabled ).calledWith( 'automated-migration/pending-status' ).mockReturnValue( false );

		const { result } = renderHookWithProvider( () => useMigrationCanceller( 123 ) );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.data ).toEqual( { status: 'skipped' } );
		} );
	} );
} );

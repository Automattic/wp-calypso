/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import nock from 'nock';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/landing/use-update-migration-status';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-config' );

describe( 'useUpdateMigrationStatus', () => {
	beforeEach( () => {
		when( isEnabled ).calledWith( 'automated-migration/pending-status' ).mockReturnValue( true );
		nock.disableNetConnect();
	} );

	it( 'updates the migration status to started', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/site-migration-status-sticker', {
				status_sticker: MigrationStatus.STARTED_DIFM,
			} )
			.reply( 200, { success: true } );

		const { result } = renderHookWithProvider( () => useUpdateMigrationStatus( 123 ) );

		result.current.mutate( { status: MigrationStatus.STARTED_DIFM } );

		await waitFor( () => {
			expect( nock.isDone() ).toBe( true );
			expect( result.current.data ).toEqual( { status: 'success' } );
		} );
	} );

	it( 'skips the status update when the status contains migration-pending- and the feature is off', async () => {
		when( isEnabled ).calledWith( 'automated-migration/pending-status' ).mockReturnValue( false );

		const { result } = renderHookWithProvider( () => useUpdateMigrationStatus( 123 ) );

		result.current.mutate( { status: MigrationStatus.PENDING_DIFM } );

		await waitFor( () => {
			expect( result.current.data ).toEqual( { status: 'skipped' } );
		} );
	} );
} );

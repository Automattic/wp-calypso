/**
 * @vitest-environment jsdom
 */
import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../../test-utils';
import BackupCard from '../index';
import type { Site, SiteActivityLog } from '@automattic/api-core';

const site = {
	ID: 123,
	plan: { features: { active: [ HostingFeatures.BACKUPS_SELF_SERVE ] } },
} as unknown as Site;

const HOUR_IN_MS = 60 * 60 * 1000;

function mockBackups( {
	latest,
	lastSuccessful = latest,
}: {
	latest: Partial< SiteActivityLog >[];
	lastSuccessful?: Partial< SiteActivityLog >[];
} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/activity` )
		.query( ( query ) => !! query[ 'name[]' ]?.includes( 'rewind__backup_error' ) )
		.reply( 200, { current: { orderedItems: latest } } );
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/activity` )
		.query( ( query ) => ! query[ 'name[]' ]?.includes( 'rewind__backup_error' ) )
		.reply( 200, { current: { orderedItems: lastSuccessful } } );
}

const failedBackup = {
	name: 'rewind__backup_error',
	published: new Date().toISOString(),
};

describe( '<BackupCard>', () => {
	test( 'shows that the first backup is on its way when there are no backups', async () => {
		mockBackups( { latest: [] } );

		render( <BackupCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'No backups yet' } ) ).toBeVisible();
		expect( screen.getByText( 'Your first backup will be ready soon.' ) ).toBeVisible();
	} );

	test( 'shows the time since the last successful backup', async () => {
		mockBackups( {
			latest: [
				{
					name: 'rewind__backup_complete_full',
					published: new Date( Date.now() - 2 * HOUR_IN_MS ).toISOString(),
				},
			],
		} );

		render( <BackupCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: '2h ago' } ) ).toBeVisible();
	} );

	test( 'shows a failed backup with the time of the last successful one', async () => {
		mockBackups( {
			latest: [ failedBackup ],
			lastSuccessful: [
				{
					name: 'rewind__backup_complete_full',
					published: new Date( Date.now() - 72 * HOUR_IN_MS ).toISOString(),
				},
			],
		} );

		render( <BackupCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'Backup failed' } ) ).toBeVisible();
		expect( await screen.findByText( 'Last successful backup was 3d ago.' ) ).toBeVisible();
	} );

	test( 'shows a failed backup with no successful one before it', async () => {
		mockBackups( { latest: [ failedBackup ], lastSuccessful: [] } );

		render( <BackupCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'Backup failed' } ) ).toBeVisible();
		expect( await screen.findByText( 'No successful backups found.' ) ).toBeVisible();
	} );
} );

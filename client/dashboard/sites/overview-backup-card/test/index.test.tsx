/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import BackupCard from '../index';
import type { Site, SiteActivityLog } from '@automattic/api-core';

const mockSiteId = 123;

const mockSite: Site = {
	ID: mockSiteId,
	plan: {
		features: {
			active: [ HostingFeatures.BACKUPS_SELF_SERVE ],
		},
	},
	is_wpcom_atomic: true,
} as Site;

// The card asks for the latest backup, failed or not, and for the latest successful one.
function mockBackups( {
	latest,
	lastSuccessful = latest,
	lastSuccessfulLoaded,
}: {
	latest: Partial< SiteActivityLog >[];
	lastSuccessful?: Partial< SiteActivityLog >[];
	lastSuccessfulLoaded?: Promise< void >;
} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity` )
		.query( ( query ) => !! query[ 'name[]' ]?.includes( 'rewind__backup_error' ) )
		.reply( 200, { current: { orderedItems: latest } } );
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity` )
		.query( ( query ) => ! query[ 'name[]' ]?.includes( 'rewind__backup_error' ) )
		.reply( async () => {
			await lastSuccessfulLoaded;
			return [ 200, { current: { orderedItems: lastSuccessful } } ];
		} );
}

vi.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
	useIntlLocale: () => 'en',
} ) );

describe( 'BackupCard', () => {
	test( 'shows "No backups yet" when there are no backups', async () => {
		mockBackups( { latest: [] } );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'No backups yet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Your first backup will be ready soon.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows successful backup information', async () => {
		const twoHoursAgo = new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString();

		mockBackups( {
			latest: [
				{
					activity_id: '1',
					name: 'rewind__backup_complete_full',
					published: twoHoursAgo,
					status: 'success',
				},
			],
		} );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( '2h ago' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Backup failed' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'shows failed backup with last successful backup time', async () => {
		mockBackups( {
			latest: [
				{
					activity_id: '2',
					name: 'rewind__backup_error',
					published: new Date().toISOString(),
					status: 'error',
				},
			],
			lastSuccessful: [
				{
					activity_id: '1',
					name: 'rewind__backup_complete_full',
					published: new Date( Date.now() - 3 * 24 * 60 * 60 * 1000 ).toISOString(), // 3 days ago
					status: 'success',
				},
			],
		} );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Backup failed' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Last successful backup was 3d ago.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows "No successful backups found" once it finds no successful backup after a failed one', async () => {
		let resolveLastSuccessful: () => void = () => {};
		const lastSuccessfulLoaded = new Promise< void >( ( resolve ) => {
			resolveLastSuccessful = resolve;
		} );
		mockBackups( {
			latest: [
				{
					activity_id: '2',
					name: 'rewind__backup_error',
					published: new Date().toISOString(),
					status: 'error',
				},
			],
			lastSuccessful: [],
			lastSuccessfulLoaded,
		} );

		render( <BackupCard site={ mockSite } /> );

		expect( await screen.findByRole( 'heading', { name: 'Backup failed' } ) ).toBeVisible();
		expect( screen.queryByText( 'No successful backups found.' ) ).not.toBeInTheDocument();

		resolveLastSuccessful();

		expect( await screen.findByText( 'No successful backups found.' ) ).toBeVisible();
	} );
} );

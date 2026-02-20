/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import StagingSiteSyncDropdown from '../index';
import type { Site } from '@automattic/api-core';

const createMockSite = ( options = {} ): Site =>
	( {
		ID: 1,
		slug: 'test-site',
		name: 'Test Site',
		URL: 'https://test-site.wordpress.com',
		is_wpcom_staging_site: false,
		options: { wpcom_staging_blog_ids: [ 2 ] },
		capabilities: {
			manage_options: true,
		},
		...options,
	} ) as Site;

const createMockStagingSite = ( options = {} ): Site =>
	( {
		ID: 2,
		slug: 'test-site',
		name: 'Test Site (Staging)',
		URL: 'https://test-site-staging.wordpress.com',
		is_wpcom_staging_site: true,
		options: { wpcom_production_blog_id: 1 },
		capabilities: {
			manage_options: true,
		},
		...options,
	} ) as Site;

function mockSiteBySlug( site: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );
}

function mockSyncState( status?: string ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/sites/1/staging-site/sync-state' )
		.query( true )
		.reply( 200, status ? { status } : {} );
}

describe( 'StagingSiteSyncDropdown', () => {
	describe( 'Component Display', () => {
		test( 'renders sync dropdown button', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			expect( await screen.findByRole( 'button', { name: 'Sync' } ) ).toBeVisible();
		} );

		test( 'shows "Syncing…" when sync is in progress', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState( 'pending' );
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			const button = await screen.findByRole( 'button', { name: 'Syncing…' } );
			expect( button ).toBeDisabled();
		} );

		test( 'returns null when no production site ID', async () => {
			// Staging site without wpcom_production_blog_id → getProductionSiteId returns undefined
			const orphanedStagingSite = createMockStagingSite( {
				options: {},
			} );
			mockSiteBySlug( orphanedStagingSite );
			const { container } = render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			await waitFor( () => expect( nock.isDone() ).toBe( true ) );
			expect( container.firstChild ).toBeNull();
		} );

		test( 'returns null when staging site is being deleted', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState();

			// "Is deleting" state is stored client-only, using TanStack Query.
			const queryClient = new QueryClient();
			queryClient.setQueryData( [ 'staging-site', 2, 'is-deleting' ], true );

			const { container } = render( <StagingSiteSyncDropdown siteSlug="test-site" />, {
				queryClient,
			} );

			await waitFor( () => expect( nock.isDone() ).toBe( true ) );
			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'Dropdown Menu Items', () => {
		test( 'displays correct menu items for production site', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			const user = userEvent.setup();
			await user.click( await screen.findByRole( 'button', { name: 'Sync' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Pull from Staging' } ) ).toBeVisible();
			expect( await screen.findByRole( 'menuitem', { name: 'Push to Staging' } ) ).toBeVisible();
		} );

		test( 'displays correct menu items for staging site', async () => {
			mockSiteBySlug( createMockStagingSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			const user = userEvent.setup();
			await user.click( await screen.findByRole( 'button', { name: 'Sync' } ) );

			expect(
				await screen.findByRole( 'menuitem', { name: 'Pull from Production' } )
			).toBeVisible();
			expect( await screen.findByRole( 'menuitem', { name: 'Push to Production' } ) ).toBeVisible();
		} );
	} );
} );

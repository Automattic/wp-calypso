/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createQueryClientBuilder, render } from '../../../test-utils';
import StagingSiteSyncDropdown from '../index';
import type { Site } from '@automattic/api-core';

jest.mock( '../../../utils/site-staging-site', () => ( {
	getProductionSiteId: jest.fn( () => 1 ),
	getStagingSiteId: jest.fn( () => 2 ),
	isStagingSiteSyncing: jest.fn( () => false ),
} ) );

const createMockSite = ( options = {} ): Site =>
	( {
		ID: 1,
		slug: 'test-site',
		name: 'Test Site',
		URL: 'https://test-site.wordpress.com',
		is_wpcom_staging_site: false,
		capabilities: {
			manage_options: true,
		},
		...options,
	} ) as Site;

const createMockStagingSite = ( options = {} ): Site =>
	( {
		ID: 2,
		slug: 'test-site-staging',
		name: 'Test Site (Staging)',
		URL: 'https://test-site-staging.wordpress.com',
		is_wpcom_staging_site: true,
		capabilities: {
			manage_options: true,
		},
		...options,
	} ) as Site;

function mockSiteBySlug( site: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/sites/test-site' )
		.query( true )
		.reply( 200, site );
}

function mockSyncState() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/sites/1/staging-site/sync-state' )
		.query( true )
		.reply( 200, {} );
}

describe( 'StagingSiteSyncDropdown', () => {
	beforeEach( () => {
		// Reset specific mock return values without clearing implementations
		const {
			getProductionSiteId,
			getStagingSiteId,
			isStagingSiteSyncing,
		} = require( '../../../utils/site-staging-site' );
		getProductionSiteId.mockReturnValue( 1 );
		getStagingSiteId.mockReturnValue( 2 );
		isStagingSiteSyncing.mockReturnValue( false );
	} );

	describe( 'Component Display', () => {
		test( 'renders sync dropdown button', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			expect( await screen.findByRole( 'button', { name: 'Sync' } ) ).toBeVisible();
		} );

		test( 'shows "Syncing…" when sync is in progress', async () => {
			const { isStagingSiteSyncing } = require( '../../../utils/site-staging-site' );
			isStagingSiteSyncing.mockReturnValue( true );

			mockSiteBySlug( createMockSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			const button = await screen.findByRole( 'button', { name: 'Syncing…' } );
			expect( button ).toBeDisabled();
		} );

		test( 'returns null when no production site ID', async () => {
			const { getProductionSiteId } = require( '../../../utils/site-staging-site' );
			getProductionSiteId.mockReturnValue( null );

			mockSiteBySlug( createMockSite() );
			const { container } = render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			await waitFor( () => expect( nock.isDone() ).toBe( true ) );
			expect( container.firstChild ).toBeNull();
		} );

		test( 'returns null when staging site is being deleted', async () => {
			mockSiteBySlug( createMockSite() );
			mockSyncState();

			const queryClient = createQueryClientBuilder()
				.withQueryData( [ 'staging-site', 2, 'is-deleting' ], true )
				.build();

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

			await waitFor( () => {
				expect( screen.getByRole( 'menuitem', { name: 'Pull from Staging' } ) ).toBeInTheDocument();
				expect( screen.getByRole( 'menuitem', { name: 'Push to Staging' } ) ).toBeInTheDocument();
			} );
		} );

		test( 'displays correct menu items for staging site', async () => {
			mockSiteBySlug( createMockStagingSite() );
			mockSyncState();
			render( <StagingSiteSyncDropdown siteSlug="test-site" /> );

			const user = userEvent.setup();
			await user.click( await screen.findByRole( 'button', { name: 'Sync' } ) );

			await waitFor( () => {
				expect(
					screen.getByRole( 'menuitem', { name: 'Pull from Production' } )
				).toBeInTheDocument();
				expect(
					screen.getByRole( 'menuitem', { name: 'Push to Production' } )
				).toBeInTheDocument();
			} );
		} );
	} );
} );

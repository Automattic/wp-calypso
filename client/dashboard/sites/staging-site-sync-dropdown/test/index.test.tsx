/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
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

// Helper functions
const getDropdownButton = () => screen.getByRole( 'button', { name: /sync/i } );
const getMenuItem = ( name: string ) => screen.getByRole( 'menuitem', { name } );

function renderDropdownWithSite(
	site: Site,
	{ isStagingSiteDeletionInProgress = false, syncState = false } = {}
) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );

	// Pre-populate site-by-slug cache. The real queryKey includes SITE_FIELDS and SITE_OPTIONS
	// arrays, but we use a fuzzy match via the queryClient filter — TQ matches by prefix, so we
	// set with the exact key structure from siteBySlugQuery.
	const { SITE_FIELDS, SITE_OPTIONS } = require( '@automattic/api-core' );
	queryClient.setQueryData( [ 'site-by-slug', 'test-site', SITE_FIELDS, SITE_OPTIONS ], site );

	const stagingSiteId = site.is_wpcom_staging_site ? site.ID : 2;
	queryClient.setQueryData(
		[ 'staging-site', stagingSiteId, 'is-deleting' ],
		isStagingSiteDeletionInProgress
	);

	const productionSiteId = site.is_wpcom_staging_site ? 1 : site.ID;
	queryClient.setQueryData( [ 'site', productionSiteId, 'staging-site-sync-state' ], syncState );

	return render( <StagingSiteSyncDropdown siteSlug="test-site" />, { queryClient } );
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
		test( 'renders sync dropdown button', () => {
			renderDropdownWithSite( createMockSite() );

			expect( getDropdownButton() ).toBeInTheDocument();
			expect( getDropdownButton() ).toHaveTextContent( 'Sync' );
		} );

		test( 'shows "Syncing…" when sync is in progress', () => {
			const { isStagingSiteSyncing } = require( '../../../utils/site-staging-site' );

			isStagingSiteSyncing.mockReturnValue( true );
			renderDropdownWithSite( createMockSite() );

			expect( getDropdownButton() ).toHaveTextContent( 'Syncing…' );
			expect( getDropdownButton() ).toBeDisabled();
		} );

		test( 'returns null when no production site ID', () => {
			const { getProductionSiteId } = require( '../../../utils/site-staging-site' );

			getProductionSiteId.mockReturnValue( null );
			const { container } = renderDropdownWithSite( createMockSite() );

			expect( container.firstChild ).toBeNull();
		} );

		test( 'returns null when staging site is being deleted', () => {
			const { container } = renderDropdownWithSite( createMockSite(), {
				isStagingSiteDeletionInProgress: true,
			} );

			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'Dropdown Menu Items', () => {
		test( 'displays correct menu items for production site', async () => {
			renderDropdownWithSite( createMockSite() );

			await waitFor( () => {
				expect( getDropdownButton() ).toBeInTheDocument();
			} );

			const user = userEvent.setup();
			await user.click( getDropdownButton() );

			await waitFor( () => {
				expect( getMenuItem( 'Pull from Staging' ) ).toBeInTheDocument();
				expect( getMenuItem( 'Push to Staging' ) ).toBeInTheDocument();
			} );
		} );

		test( 'displays correct menu items for staging site', async () => {
			renderDropdownWithSite( createMockStagingSite() );

			await waitFor( () => {
				expect( getDropdownButton() ).toBeInTheDocument();
			} );

			const user = userEvent.setup();
			await user.click( getDropdownButton() );

			await waitFor( () => {
				expect( getMenuItem( 'Pull from Production' ) ).toBeInTheDocument();
				expect( getMenuItem( 'Push to Production' ) ).toBeInTheDocument();
			} );
		} );
	} );
} );

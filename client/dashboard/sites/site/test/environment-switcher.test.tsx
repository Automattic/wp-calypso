/**
 * @jest-environment jsdom
 */

import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import EnvironmentSwitcher from '../environment-switcher';
import type { Site } from '@automattic/api-core';

const mockCreateSuccessNotice = jest.fn();
const mockCreateNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createNotice: mockCreateNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	useSelect: jest.fn( () => ( {} ) ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
} ) );

// Test data
const mockProductionSiteWithStaging: Site = {
	ID: 1,
	slug: 'test-site',
	name: 'Test Site',
	URL: 'https://test-site.wordpress.com',
	is_wpcom_staging_site: false,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { wpcom_staging_blog_ids: [ 2 ] },
	site_migration: { in_progress: false },
	plan: { features: { active: [ 'staging-sites' ] } },
} as Site;

const mockProductionSiteWithoutStaging: Site = {
	ID: 1,
	slug: 'test-site',
	name: 'Test Site',
	URL: 'https://test-site.wordpress.com',
	is_wpcom_staging_site: false,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { wpcom_staging_blog_ids: [] as number[] },
	site_migration: { in_progress: false },
	plan: { features: { active: [ 'staging-sites' ] } },
} as Site;

const mockStagingSite: Site = {
	ID: 2,
	slug: 'test-site-staging',
	name: 'Test Site (Staging)',
	URL: 'https://test-site-staging.wordpress.com',
	is_wpcom_staging_site: true,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { wpcom_production_blog_id: 1 },
	site_migration: { in_progress: false },
	plan: { features: { active: [ 'staging-sites' ] } },
} as Site;

/** Set up nock interceptors for network-backed queries. */
function setupNock(
	productionSite: Site,
	extra: {
		stagingSite?: Site;
		hasValidQuota?: boolean;
		connectionHealth?: { is_healthy: boolean };
	} = {}
) {
	nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: {},
		} );

	nock( 'https://public-api.wordpress.com:443' )
		.get( `/rest/v1.1/sites/${ productionSite.ID }` )
		.query( true )
		.reply( 200, productionSite );

	if ( extra.stagingSite ) {
		nock( 'https://public-api.wordpress.com:443' )
			.get( `/rest/v1.1/sites/${ extra.stagingSite.ID }` )
			.query( true )
			.reply( 200, extra.stagingSite );
	}

	if ( extra.hasValidQuota !== undefined ) {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/${ productionSite.ID }/staging-site/validate-quota` )
			.reply( 200, () => extra.hasValidQuota );
	}

	if ( extra.connectionHealth !== undefined ) {
		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ productionSite.ID }/jetpack-connection-health` )
			.query( true )
			.reply( 200, extra.connectionHealth );
	}
}

/** Build a QueryClient with only client-managed state (no network endpoint). */
function buildQueryClient(
	productionSite: Site,
	extra: {
		isCreating?: boolean;
		isDeleting?: boolean;
	} = {}
) {
	const qc = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	const stagingSiteId = productionSite.options?.wpcom_staging_blog_ids?.[ 0 ];

	qc.setQueryData(
		[ 'staging-site', productionSite.ID, 'is-creating' ],
		Boolean( extra.isCreating )
	);

	if ( stagingSiteId ) {
		qc.setQueryData(
			[ 'staging-site', stagingSiteId, 'is-deleting' ],
			Boolean( extra.isDeleting )
		);
	}

	// Pre-populate with a non-in-progress, non-completed status to prevent both
	// refetch polling and enabling the staging site query (which would enter an
	// infinite refetch loop with no nock interceptor for the staging site).
	if ( extra.isCreating && stagingSiteId ) {
		qc.setQueryData( [ 'site', stagingSiteId, 'atomic', 'transfers', 'latest' ], {
			status: 'error',
		} );
	}

	return qc;
}

const clickDropdown = async ( user: ReturnType< typeof userEvent.setup > ) => {
	await waitFor( () => {
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );
	await user.click( screen.getByRole( 'button' ) );
};

describe( 'EnvironmentSwitcher', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'Environment Display', () => {
		test( 'displays "Production" for production sites', () => {
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );
			expect( screen.getByText( 'Production' ) ).toBeVisible();
		} );

		test( 'displays "Staging" for staging sites', () => {
			render( <EnvironmentSwitcher site={ mockStagingSite } /> );
			expect( screen.getByText( 'Staging' ) ).toBeVisible();
		} );
	} );

	describe( 'Staging Site Actions', () => {
		test( 'displays "Add staging site" button when no staging site exists', async () => {
			setupNock( mockProductionSiteWithoutStaging );
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, {
				queryClient,
			} );

			await clickDropdown( user );
			await waitFor( () => expect( screen.getByText( 'Add staging site' ) ).toBeVisible() );
		} );

		test( 'shows error notice when user has insufficient quota', async () => {
			setupNock( mockProductionSiteWithoutStaging, {
				hasValidQuota: false,
				connectionHealth: { is_healthy: true },
			} );
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, { queryClient } );

			await clickDropdown( user );
			await user.click( await screen.findByText( 'Add staging site' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Your available storage space is below 50%, which is insufficient for creating a staging site.',
				{ type: 'snackbar' }
			);
		} );

		test( 'shows error notice when jetpack connection is unhealthy', async () => {
			setupNock( mockProductionSiteWithoutStaging, {
				hasValidQuota: true,
				connectionHealth: { is_healthy: false },
			} );
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, { queryClient } );

			await clickDropdown( user );
			await user.click( await screen.findByText( 'Add staging site' ) );

			expect( mockCreateNotice ).toHaveBeenCalledWith(
				'error',
				'Cannot add a staging site due to a Jetpack connection issue.',
				{
					type: 'snackbar',
					actions: [
						{
							label: 'Contact support',
							url: null,
							onClick: expect.any( Function ),
						},
					],
				}
			);
		} );

		test( 'displays "Adding staging site..." when staging site is being created', async () => {
			setupNock( mockProductionSiteWithStaging );
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				isCreating: true,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			await waitFor( () => expect( screen.getByText( 'Adding staging site…' ) ).toBeVisible() );
		} );

		test( 'displays "Deleting staging site..." when staging site is being deleted', async () => {
			setupNock( mockProductionSiteWithStaging, {
				stagingSite: mockStagingSite,
			} );
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				isDeleting: true,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			await waitFor( () => expect( screen.getByText( 'Deleting staging site…' ) ).toBeVisible() );
		} );

		test( 'shows success notice and fires mutation when "Add staging site" is clicked', async () => {
			setupNock( mockProductionSiteWithoutStaging, {
				hasValidQuota: true,
				connectionHealth: { is_healthy: true },
			} );
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging );

			const mutationScope = nock( 'https://public-api.wordpress.com:443' )
				.post( '/wpcom/v2/sites/1/staging-site' )
				.reply( 200, { success: true } );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, {
				queryClient,
			} );

			await clickDropdown( user );
			await user.click( await screen.findByText( 'Add staging site' ) );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Setting up your staging site — this may take a few minutes. We’ll email you when it’s ready.',
				{ type: 'snackbar' }
			);

			expect( mutationScope.isDone() ).toBe( true );
		} );
	} );
} );

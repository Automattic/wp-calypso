/**
 * @jest-environment jsdom
 */

import { SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
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

jest.mock( '../../../utils/site-atomic-transfers', () => ( {
	isAtomicTransferInProgress: jest.fn( () => false ),
	isAtomicTransferredSite: jest.fn( () => true ),
} ) );

jest.mock( '../../../utils/site-staging-site', () => ( {
	getProductionSiteId: jest.fn( ( site: Site ) => site.ID ),
	getStagingSiteId: jest.fn( ( site: Site ) => site.ID + 1 ),
} ) );

jest.mock( '../../features', () => ( {
	canManageSite: jest.fn( () => true ),
	canCreateStagingSite: jest.fn( () => true ),
} ) );

// Test data
const mockProductionSiteWithStaging: Site = {
	ID: 1,
	slug: 'test-site',
	name: 'Test Site',
	URL: 'https://test-site.wordpress.com',
	is_wpcom_staging_site: false,
	capabilities: {
		manage_options: true,
	},
	options: {
		wpcom_staging_blog_ids: [ 2 ],
	},
} as Site;

const mockProductionSiteWithoutStaging: Site = {
	ID: 1,
	slug: 'test-site',
	name: 'Test Site',
	URL: 'https://test-site.wordpress.com',
	is_wpcom_staging_site: false,
	capabilities: {
		manage_options: true,
	},
	options: {
		wpcom_staging_blog_ids: [] as number[],
	},
} as Site;

const mockStagingSite: Site = {
	ID: 2,
	slug: 'test-site-staging',
	name: 'Test Site (Staging)',
	URL: 'https://test-site-staging.wordpress.com',
	is_wpcom_staging_site: true,
	capabilities: {
		manage_options: true,
	},
} as Site;

/**
 * Build a QueryClient pre-populated with the data the EnvironmentSwitcher
 * component needs. All queries use real query key structures.
 */
function buildQueryClient(
	productionSite: Site,
	extra: {
		isCreating?: boolean;
		isDeleting?: boolean;
		stagingSite?: Site;
		hasValidQuota?: boolean;
		connectionHealth?: { is_healthy: boolean };
	} = {}
) {
	const qc = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	qc.setQueryData( [ 'me', 'preferences' ], {} );
	qc.setQueryData( [ 'site-by-id', productionSite.ID, SITE_FIELDS, SITE_OPTIONS ], productionSite );
	qc.setQueryData(
		[ 'staging-site', productionSite.ID, 'is-creating' ],
		Boolean( extra.isCreating )
	);
	qc.setQueryData(
		[ 'staging-site', productionSite.ID + 1, 'is-deleting' ],
		Boolean( extra.isDeleting )
	);

	if ( extra.stagingSite ) {
		qc.setQueryData(
			[ 'site-by-id', extra.stagingSite.ID, SITE_FIELDS, SITE_OPTIONS ],
			extra.stagingSite
		);
	}
	if ( extra.hasValidQuota !== undefined ) {
		qc.setQueryData( [ 'site', productionSite.ID, 'has-valid-quota' ], extra.hasValidQuota );
	}
	if ( extra.connectionHealth !== undefined ) {
		qc.setQueryData(
			[ 'site', productionSite.ID, 'jetpack-connection-health' ],
			extra.connectionHealth
		);
	}

	return qc;
}

const clickDropdown = async ( user: ReturnType< typeof userEvent.setup > ) => {
	const button = screen.getByRole( 'button' );
	await user.click( button );
};

describe( 'EnvironmentSwitcher', () => {
	describe( 'Environment Display', () => {
		test( 'displays "Production" for production sites', () => {
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );
			expect( screen.getByText( 'Production' ) ).toBeInTheDocument();
		} );

		test( 'displays "Staging" for staging sites', () => {
			render( <EnvironmentSwitcher site={ mockStagingSite } /> );
			expect( screen.getByText( 'Staging' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Staging Site Actions', () => {
		test( 'displays "Add staging site" button when no staging site exists', async () => {
			// Test true "no staging site" scenario: empty wpcom_staging_blog_ids array
			// means getStagingSiteId() returns undefined, so no staging site queries run
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging, {
				isCreating: false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, {
				queryClient,
			} );

			await clickDropdown( user );
			expect( screen.getByText( 'Add staging site' ) ).toBeInTheDocument();
		} );

		test( 'shows error notice when user has insufficient quota', async () => {
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				hasValidQuota: false,
				connectionHealth: { is_healthy: true },
				isCreating: false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			await user.click( screen.getByText( 'Add staging site' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Your available storage space is below 50%, which is insufficient for creating a staging site.',
				{ type: 'snackbar' }
			);
		} );

		test( 'shows error notice when jetpack connection is unhealthy', async () => {
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				hasValidQuota: true,
				connectionHealth: { is_healthy: false },
				isCreating: false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			await user.click( screen.getByText( 'Add staging site' ) );

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
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				isCreating: true,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			expect( screen.getByText( 'Adding staging site…' ) ).toBeInTheDocument();
		} );

		test( 'displays "Deleting staging site..." when staging site is being deleted', async () => {
			const queryClient = buildQueryClient( mockProductionSiteWithStaging, {
				stagingSite: mockStagingSite,
				isDeleting: true,
				isCreating: false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } />, { queryClient } );

			await clickDropdown( user );
			expect( screen.getByText( 'Deleting staging site…' ) ).toBeInTheDocument();
		} );

		test( 'shows success notice and fires mutation when "Add staging site" is clicked', async () => {
			const queryClient = buildQueryClient( mockProductionSiteWithoutStaging, {
				hasValidQuota: true,
				connectionHealth: { is_healthy: true },
				isCreating: false,
			} );

			const scope = nock( 'https://public-api.wordpress.com:443' )
				.post( '/wpcom/v2/sites/1/staging-site' )
				.reply( 200, { success: true } );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } />, {
				queryClient,
			} );

			await clickDropdown( user );
			await user.click( screen.getByText( 'Add staging site' ) );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Setting up your staging site — this may take a few minutes. We’ll email you when it’s ready.',
				{ type: 'snackbar' }
			);

			expect( scope.isDone() ).toBe( true );
		} );
	} );
} );

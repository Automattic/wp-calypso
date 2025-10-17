/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import EnvironmentSwitcher from '../environment-switcher';
import type { Site } from '@automattic/api-core';

// Mock the hooks and dependencies we need to control
const mockCreateSuccessNotice = jest.fn();
const mockCreateNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockMutate = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

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

jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'site-by-id', siteId ],
		queryFn: () => Promise.resolve( { ID: siteId, slug: 'test-site' } ),
	} ) ),
	stagingSiteCreateMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( { success: true } ),
	} ) ),
	isDeletingStagingSiteQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'is-deleting-staging', siteId ],
		queryFn: () => Promise.resolve( false ),
	} ) ),
	hasStagingSiteQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'has-staging-site', siteId ],
		queryFn: () => Promise.resolve( false ),
	} ) ),
	hasValidQuotaQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'has-valid-quota', siteId ],
		queryFn: () => Promise.resolve( true ),
	} ) ),
	jetpackConnectionHealthQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'jetpack-connection', siteId ],
		queryFn: () => Promise.resolve( { is_healthy: true } ),
	} ) ),
	siteLatestAtomicTransferQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'site-latest-atomic-transfer', siteId ],
		queryFn: () => Promise.resolve( { status: 'completed' } ),
	} ) ),
	isCreatingStagingSiteQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'is-creating-staging', siteId ],
		queryFn: () => Promise.resolve( false ),
	} ) ),
	siteBySlugQuery: jest.fn( ( slug ) => ( {
		queryKey: [ 'site-by-slug', slug ],
		queryFn: () => Promise.resolve( { slug, ID: 1 } ),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {
		invalidateQueries: mockInvalidateQueries,
	} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useQuery: jest.fn( () => ( { data: undefined, isLoading: false, error: null } ) ),
	useMutation: jest.fn( () => ( {
		mutate: mockMutate,
		isLoading: false,
		error: null,
	} ) ),
	useQueryClient: jest.fn( () => ( {
		invalidateQueries: mockInvalidateQueries,
	} ) ),
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

// Test helpers for query mocking and common interactions
const mockUseQuery = ( mockData: Record< string, unknown > ) => {
	const { useQuery } = require( '@tanstack/react-query' );
	useQuery.mockImplementation(
		( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
			const queryKey = options?.queryKey?.join( '-' ) || '';

			for ( const [ key, value ] of Object.entries( mockData ) ) {
				if ( queryKey.includes( key ) ) {
					return { data: value, isLoading: false, error: null };
				}
			}

			return { data: false, isLoading: false, error: null };
		}
	);
};

const clickDropdown = async ( user: ReturnType< typeof userEvent.setup > ) => {
	const button = screen.getByRole( 'button' );
	await user.click( button );
};

describe( 'EnvironmentSwitcher', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

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
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithoutStaging,
				'is-creating-staging': false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } /> );

			await clickDropdown( user );
			expect( screen.getByText( 'Add staging site' ) ).toBeInTheDocument();
		} );

		test( 'shows error notice when user has insufficient quota', async () => {
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithStaging,
				'has-valid-quota': false,
				'jetpack-connection': { is_healthy: true },
				'is-creating-staging': false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

			await clickDropdown( user );
			await user.click( screen.getByText( 'Add staging site' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Your available storage space is below 50%, which is insufficient for creating a staging site.',
				{ type: 'snackbar' }
			);
		} );

		test( 'shows error notice when jetpack connection is unhealthy', async () => {
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithStaging,
				'has-valid-quota': true,
				'jetpack-connection': { is_healthy: false },
				'is-creating-staging': false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

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
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithStaging,
				'is-creating-staging': true,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

			await clickDropdown( user );
			expect( screen.getByText( 'Adding staging site…' ) ).toBeInTheDocument();
		} );

		test( 'displays "Deleting staging site..." when staging site is being deleted', async () => {
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithStaging,
				'site-by-id-2': mockStagingSite,
				'is-deleting-staging': true,
				'is-creating-staging': false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

			await clickDropdown( user );
			expect( screen.getByText( 'Deleting staging site…' ) ).toBeInTheDocument();
		} );

		test( 'shows success notice and calls mutation when "Add staging site" button is clicked', async () => {
			mockUseQuery( {
				'site-by-id-1': mockProductionSiteWithoutStaging,
				'has-valid-quota': true,
				'jetpack-connection': { is_healthy: true },
				'is-creating-staging': false,
			} );

			const user = userEvent.setup();
			render( <EnvironmentSwitcher site={ mockProductionSiteWithoutStaging } /> );

			await clickDropdown( user );
			await user.click( screen.getByText( 'Add staging site' ) );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Setting up your staging site — this may take a few minutes. We’ll email you when it’s ready.',
				{ type: 'snackbar' }
			);

			expect( mockMutate ).toHaveBeenCalled();
		} );
	} );
} );

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
const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockMutate = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();

// Mock calypso analytics
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Mock WordPress data
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createNotice: mockCreateNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
} ) );

// Mock help center
jest.mock( '../../../app/help-center', () => ( {
	useHelpCenter: () => ( {
		setShowHelpCenter: mockSetShowHelpCenter,
		setNavigateToRoute: mockSetNavigateToRoute,
	} ),
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

// Mock React Query hooks
jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {
		invalidateQueries: mockInvalidateQueries,
		setQueryData: mockSetQueryData,
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
		setQueryData: mockSetQueryData,
	} ) ),
} ) );

// Mock React Query Persist
jest.mock( '@tanstack/react-query-persist-client', () => ( {
	persistQueryClient: jest.fn( () => [ jest.fn(), Promise.resolve() ] ),
} ) );

// Mock utility functions
jest.mock( '../../../utils/site-atomic-transfers', () => ( {
	isAtomicTransferInProgress: jest.fn( () => false ),
	isAtomicTransferredSite: jest.fn( () => true ),
} ) );

jest.mock( '../../../utils/site-staging-site', () => ( {
	getProductionSiteId: jest.fn( ( site: Site ) => site.ID ),
	getStagingSiteId: jest.fn( ( site: Site ) => site.ID + 1 ),
} ) );

// Mock features
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
		wpcom_staging_blog_ids: [ 2 ], // Has staging site
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

describe( 'EnvironmentSwitcher', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'displays "Production" for production sites', () => {
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );
		expect( screen.getByText( 'Production' ) ).toBeInTheDocument();
	} );

	test( 'displays "Staging" for staging sites', () => {
		render( <EnvironmentSwitcher site={ mockStagingSite } /> );
		expect( screen.getByText( 'Staging' ) ).toBeInTheDocument();
	} );

	test( 'displays "Add staging site" button when no staging site exists', async () => {
		const { useQuery } = require( '@tanstack/react-query' );

		// Mock to return specific data based on query type
		useQuery.mockImplementation(
			( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
				// Return production site only for production site ID (1)
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 1 ) ) {
					return { data: mockProductionSiteWithStaging, isLoading: false, error: null };
				}
				// Return undefined for staging site queries (getStagingSiteId returns undefined anyway)
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.enabled === false ) {
					return { data: undefined, isLoading: false, error: null };
				}
				// Return false for creating staging site query (not currently creating)
				if ( options?.queryKey?.includes( 'is-creating-staging' ) ) {
					return { data: false, isLoading: false, error: null };
				}
				// Return false for all other queries
				return { data: false, isLoading: false, error: null };
			}
		);

		const user = userEvent.setup();
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

		// Click the dropdown button to open it
		const button = screen.getByRole( 'button' );
		await user.click( button );

		// Check for "Add staging site" button
		expect( screen.getByText( 'Add staging site' ) ).toBeInTheDocument();
	} );

	test( 'shows error notice when user has insufficient quota', async () => {
		const { useQuery } = require( '@tanstack/react-query' );

		// Mock to simulate insufficient quota scenario
		useQuery.mockImplementation(
			( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
				// Return production site
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 1 ) ) {
					return { data: mockProductionSiteWithStaging, isLoading: false, error: null };
				}
				// Return false for has-valid-quota query (insufficient quota)
				if ( options?.queryKey?.includes( 'has-valid-quota' ) ) {
					return { data: false, isLoading: false, error: null };
				}
				// Return true for connection health
				if ( options?.queryKey?.includes( 'jetpack-connection' ) ) {
					return { data: { is_healthy: true }, isLoading: false, error: null };
				}
				// Return false for creating staging site query
				if ( options?.queryKey?.includes( 'is-creating-staging' ) ) {
					return { data: false, isLoading: false, error: null };
				}
				// Return false for all other queries
				return { data: false, isLoading: false, error: null };
			}
		);

		const user = userEvent.setup();
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

		// Click the dropdown button to open it
		const button = screen.getByRole( 'button' );
		await user.click( button );

		// Click the "Add staging site" button
		const addButton = screen.getByText( 'Add staging site' );
		await user.click( addButton );

		// Check that error notice was called
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'Your available storage space is below 50%, which is insufficient for creating a staging site.',
			{ type: 'snackbar' }
		);
	} );

	test( 'shows error notice when jetpack connection is unhealthy', async () => {
		const { useQuery } = require( '@tanstack/react-query' );

		// Mock to simulate unhealthy jetpack connection
		useQuery.mockImplementation(
			( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
				// Return production site
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 1 ) ) {
					return { data: mockProductionSiteWithStaging, isLoading: false, error: null };
				}
				// Return true for has-valid-quota query
				if ( options?.queryKey?.includes( 'has-valid-quota' ) ) {
					return { data: true, isLoading: false, error: null };
				}
				// Return unhealthy connection
				if ( options?.queryKey?.includes( 'jetpack-connection' ) ) {
					return { data: { is_healthy: false }, isLoading: false, error: null };
				}
				// Return false for creating staging site query
				if ( options?.queryKey?.includes( 'is-creating-staging' ) ) {
					return { data: false, isLoading: false, error: null };
				}
				// Return false for all other queries
				return { data: false, isLoading: false, error: null };
			}
		);

		const user = userEvent.setup();
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

		// Click the dropdown button to open it
		const button = screen.getByRole( 'button' );
		await user.click( button );

		// Click the "Add staging site" button
		const addButton = screen.getByText( 'Add staging site' );
		await user.click( addButton );

		// Check that error notice was called
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
		const { useQuery } = require( '@tanstack/react-query' );

		// Mock to simulate staging site creation in progress
		useQuery.mockImplementation(
			( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
				// Return production site
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 1 ) ) {
					return { data: mockProductionSiteWithStaging, isLoading: false, error: null };
				}
				// Return true for creating staging site query (creation in progress)
				if ( options?.queryKey?.includes( 'is-creating-staging' ) ) {
					return { data: true, isLoading: false, error: null };
				}
				// Return false for all other queries
				return { data: false, isLoading: false, error: null };
			}
		);

		const user = userEvent.setup();
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

		// Click the dropdown button to open it
		const button = screen.getByRole( 'button' );
		await user.click( button );

		// Check for "Adding staging site..." text
		expect( screen.getByText( 'Adding staging site…' ) ).toBeInTheDocument();
	} );

	test( 'displays "Deleting staging site..." when staging site is being deleted', async () => {
		const { useQuery } = require( '@tanstack/react-query' );

		// Mock to simulate staging site deletion in progress
		useQuery.mockImplementation(
			( options: { queryKey?: ( string | number )[]; enabled?: boolean } ) => {
				// Return production site
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 1 ) ) {
					return { data: mockProductionSiteWithStaging, isLoading: false, error: null };
				}
				// Return staging site
				if ( options?.queryKey?.includes( 'site-by-id' ) && options?.queryKey?.includes( 2 ) ) {
					return { data: mockStagingSite, isLoading: false, error: null };
				}
				// Return true for deleting staging site query (deletion in progress)
				if ( options?.queryKey?.includes( 'is-deleting-staging' ) ) {
					return { data: true, isLoading: false, error: null };
				}
				// Return false for creating staging site query
				if ( options?.queryKey?.includes( 'is-creating-staging' ) ) {
					return { data: false, isLoading: false, error: null };
				}
				// Return false for all other queries
				return { data: false, isLoading: false, error: null };
			}
		);

		const user = userEvent.setup();
		render( <EnvironmentSwitcher site={ mockProductionSiteWithStaging } /> );

		// Click the dropdown button to open it
		const button = screen.getByRole( 'button' );
		await user.click( button );

		// Check for "Deleting staging site..." text
		expect( screen.getByText( 'Deleting staging site…' ) ).toBeInTheDocument();
	} );
} );

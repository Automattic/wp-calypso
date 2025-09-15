/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
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
	siteByIdQuery: jest.fn(),
	stagingSiteCreateMutation: jest.fn(),
	isDeletingStagingSiteQuery: jest.fn(),
	hasStagingSiteQuery: jest.fn(),
	hasValidQuotaQuery: jest.fn(),
	jetpackConnectionHealthQuery: jest.fn(),
	siteLatestAtomicTransferQuery: jest.fn(),
	isCreatingStagingSiteQuery: jest.fn(),
	siteBySlugQuery: jest.fn(),
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
const mockProductionSite: Site = {
	ID: 1,
	slug: 'test-site',
	name: 'Test Site',
	URL: 'https://test-site.wordpress.com',
	is_wpcom_staging_site: false,
	capabilities: {
		manage_options: true,
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
		render( <EnvironmentSwitcher site={ mockProductionSite } /> );
		expect( screen.getByText( 'Production' ) ).toBeInTheDocument();
	} );

	test( 'displays "Staging" for staging sites', () => {
		render( <EnvironmentSwitcher site={ mockStagingSite } /> );
		expect( screen.getByText( 'Staging' ) ).toBeInTheDocument();
	} );
} );

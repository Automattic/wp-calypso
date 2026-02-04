/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import StagingSiteSyncDropdown from '../index';
import type { Site } from '@automattic/api-core';
import type { UseQueryOptions } from '@tanstack/react-query';

jest.mock( '@automattic/api-queries', () => ( {
	siteBySlugQuery: jest.fn( () => ( {
		queryKey: [ 'site-by-slug' ],
		queryFn: () => Promise.resolve( {} ),
	} ) ),
	stagingSiteSyncStateQuery: jest.fn( () => ( {
		queryKey: [ 'staging-site-sync-state' ],
		queryFn: () => Promise.resolve( {} ),
	} ) ),
	isDeletingStagingSiteQuery: jest.fn( () => ( {
		queryKey: [ 'is-deleting-staging-site' ],
		queryFn: () => Promise.resolve( false ),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {
		getQueryCache: jest.fn( () => ( {
			subscribe: jest.fn( () => jest.fn() ),
		} ) ),
		getMutationCache: jest.fn( () => ( {
			subscribe: jest.fn( () => jest.fn() ),
		} ) ),
	} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useQuery: jest.fn( () => ( {
		data: false, // Default to false for isStagingSiteDeletionInProgress
		isLoading: false,
		refetch: jest.fn(),
	} ) ),
	defaultShouldDehydrateQuery: jest.fn( () => true ),
} ) );

jest.mock( '@tanstack/react-query-persist-client', () => ( {
	persistQueryClient: jest.fn( () => [ jest.fn(), Promise.resolve() ] ),
} ) );

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
const renderDropdown = ( siteSlug = 'test-site' ) =>
	render( <StagingSiteSyncDropdown siteSlug={ siteSlug } /> );

const mockUseQueryWithSite = (
	site: Site,
	isStagingSiteDeletionInProgress = false,
	syncState = false
) => {
	const { useQuery } = require( '@tanstack/react-query' );
	useQuery.mockImplementation( ( query: UseQueryOptions ) => {
		if ( query.queryKey?.includes( 'site-by-slug' ) ) {
			return { data: site, isLoading: false, refetch: jest.fn() };
		}
		if ( query.queryKey?.includes( 'is-deleting-staging-site' ) ) {
			return { data: isStagingSiteDeletionInProgress, isLoading: false, refetch: jest.fn() };
		}
		if ( query.queryKey?.includes( 'staging-site-sync-state' ) ) {
			return { data: syncState, isLoading: false, refetch: jest.fn() };
		}
		return { data: false, isLoading: false, refetch: jest.fn() };
	} );
};

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
			mockUseQueryWithSite( createMockSite() );

			renderDropdown();

			expect( getDropdownButton() ).toBeInTheDocument();
			expect( getDropdownButton() ).toHaveTextContent( 'Sync' );
		} );

		test( 'shows "Syncing…" when sync is in progress', () => {
			const { isStagingSiteSyncing } = require( '../../../utils/site-staging-site' );

			isStagingSiteSyncing.mockReturnValue( true );
			mockUseQueryWithSite( createMockSite() );

			renderDropdown();

			expect( getDropdownButton() ).toHaveTextContent( 'Syncing…' );
			expect( getDropdownButton() ).toBeDisabled();
		} );

		test( 'returns null when no production site ID', () => {
			const { getProductionSiteId } = require( '../../../utils/site-staging-site' );

			getProductionSiteId.mockReturnValue( null );
			mockUseQueryWithSite( createMockSite() );

			const { container } = renderDropdown();

			expect( container.firstChild ).toBeNull();
		} );

		test( 'returns null when staging site is being deleted', () => {
			mockUseQueryWithSite( createMockSite(), true ); // true = isStagingSiteDeletionInProgress

			const { container } = renderDropdown();

			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'Dropdown Menu Items', () => {
		test( 'displays correct menu items for production site', async () => {
			mockUseQueryWithSite( createMockSite() );
			renderDropdown();

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
			mockUseQueryWithSite( createMockStagingSite() );

			renderDropdown();

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

/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import StagingSiteSyncModal from '../index';
import type { Site } from '@automattic/api-core';
import type { UseQueryOptions } from '@tanstack/react-query';

jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( () => ( {
		queryKey: [ 'site-by-id' ],
		queryFn: () => Promise.resolve( {} ),
	} ) ),
	pushToStagingMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( {} ),
	} ) ),
	pullFromStagingMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( {} ),
	} ) ),
	siteBackupContentsQuery: jest.fn( () => ( {
		queryKey: [ 'site-backup-contents' ],
		queryFn: () => Promise.resolve( {} ),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useQuery: jest.fn( () => ( {
		data: undefined,
		isLoading: false,
		refetch: jest.fn(),
	} ) ),
	useMutation: jest.fn( () => ( {
		mutate: jest.fn(),
		isPending: false,
	} ) ),
} ) );

jest.mock( '../../../../data/activity-log/use-rewindable-activity-log-query', () =>
	jest.fn( () => ( {
		data: [
			{
				rewindId: 12345,
				activityTs: 1640995200000, // 2022-01-01 00:00:00
			},
		],
		isLoading: false,
	} ) )
);

jest.mock( '../../../app/analytics', () => ( {
	useAnalytics: () => ( {
		recordTracksEvent: jest.fn(),
	} ),
} ) );

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
} ) );

// Don't mock FileBrowser - let it render normally

jest.mock( '../../../components/inline-support-link', () => {
	return jest.fn( ( { children } ) => <button>{ children }</button> );
} );

const mockFileBrowserState = {
	sqlNodeState: 'unchecked',
};

jest.mock(
	'../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		FileBrowserProvider: ( { children }: { children: React.ReactNode } ) => children,
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: jest.fn( () => ( {
					totalItems: 5,
					includeList: [ { id: '/wp-content' } ],
					excludeList: [],
				} ) ),
				getNode: jest.fn( ( path: string ) => {
					if ( path === '/wp-content' || path === '/wp-config.php' ) {
						return { checkState: 'unchecked' };
					}
					if ( path === '/sql' ) {
						return { checkState: mockFileBrowserState.sqlNodeState };
					}
					return null;
				} ),
				setNodeCheckState: jest.fn( ( path: string, state: string ) => {
					if ( path === '/sql' ) {
						mockFileBrowserState.sqlNodeState = state;
					}
				} ),
			},
		} ),
	} )
);

const createMockSite = ( options = {} ): Site =>
	( {
		ID: 1,
		slug: 'test-site',
		name: 'Test Site',
		URL: 'https://test-site.wordpress.com',
		is_wpcom_staging_site: false,
		options: {
			woocommerce_is_active: false,
		},
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
		options: {
			woocommerce_is_active: false,
		},
		capabilities: {
			manage_options: true,
		},
		...options,
	} ) as Site;

const mockUseQuery = ( productionSite?: Site, stagingSite?: Site ) => {
	const { useQuery } = require( '@tanstack/react-query' );
	useQuery.mockImplementation( ( query: UseQueryOptions ) => {
		const queryKey = query.queryKey as ( string | number )[];
		if ( queryKey?.includes( 'site-by-id' ) ) {
			if ( queryKey.includes( 1 ) ) {
				return { data: productionSite, isLoading: false, refetch: jest.fn() };
			}
			if ( queryKey.includes( 2 ) ) {
				return { data: stagingSite, isLoading: false, refetch: jest.fn() };
			}
		}
		// Also handle backup-related queries to avoid undefined data
		if ( queryKey?.includes( 'site-backup-contents' ) ) {
			return { data: [], isLoading: false, refetch: jest.fn() };
		}
		return { data: undefined, isLoading: false, refetch: jest.fn() };
	} );
};

const mockUseMutation = ( mutationResult = {} ) => {
	const { useMutation } = require( '@tanstack/react-query' );
	useMutation.mockReturnValue( {
		mutate: jest.fn(),
		isPending: false,
		...mutationResult,
	} );
};

const defaultProps = {
	onClose: jest.fn(),
	syncType: 'pull' as const,
	environment: 'production' as const,
	productionSiteId: 1,
	stagingSiteId: 2,
	onSyncStart: jest.fn(),
};

const renderModal = ( props = {} ) => {
	return render( <StagingSiteSyncModal { ...defaultProps } { ...props } /> );
};

describe( 'StagingSiteSyncModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseMutation();
	} );

	describe( 'Component Rendering', () => {
		test( 'renders modal with correct title for pull from staging', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal( { syncType: 'pull', environment: 'production' } );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Pull from Staging' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for push to production', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal( { syncType: 'push', environment: 'staging' } );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Push to Production' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for pull from production', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal( { syncType: 'pull', environment: 'staging' } );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Pull from Production' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for push to staging', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal( { syncType: 'push', environment: 'production' } );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Push to Staging' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'File and Database Selection', () => {
		test( 'renders files and folders checkbox', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal();

			expect( screen.getByLabelText( 'Files and folders' ) ).toBeInTheDocument();
		} );

		test( 'renders database checkbox', () => {
			mockUseQuery( createMockSite(), createMockStagingSite() );

			renderModal();

			expect( screen.getByLabelText( 'Database' ) ).toBeInTheDocument();
		} );
	} );
} );

describe( 'File Selection', () => {
	test( 'renders file selection mode dropdown', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal();

		expect( screen.getByLabelText( 'Select files and folders to sync' ) ).toBeInTheDocument();
	} );
} );

describe( 'Domain Confirmation', () => {
	test( 'shows domain confirmation field when syncing to production', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'push', environment: 'staging' } );

		expect( screen.getByLabelText( 'Type the site domain to confirm' ) ).toBeInTheDocument();
	} );

	test( 'does not show domain confirmation when not syncing to production', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'push', environment: 'production' } );

		expect( screen.queryByLabelText( 'Type the site domain to confirm' ) ).not.toBeInTheDocument();
	} );
} );

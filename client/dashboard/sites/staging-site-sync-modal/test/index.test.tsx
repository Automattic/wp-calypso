/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import StagingSiteSyncModal from '../index';
import type { Site } from '@automattic/api-core';
import type { UseQueryOptions } from '@tanstack/react-query';

jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( ( id: number ) => ( {
		queryKey: [ 'site-by-id', id ],
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

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
} ) );

jest.mock( '../../../components/inline-support-link', () => {
	return jest.fn( ( { children } ) => <button>{ children }</button> );
} );

// Mock file browser context with a real Provider using state so updates re-render the tree
jest.mock(
	'../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => {
		const { createContext, useContext, createElement, useState } = require( '@wordpress/element' );

		const FileBrowserContext = createContext( null );

		const FileBrowserProvider = ( { children }: { children: React.ReactNode } ) => {
			const [ sqlState, setSqlState ] = useState( 'unchecked' );
			const fileBrowserState = {
				getCheckList: () => ( {
					totalItems: 0,
					includeList: [],
					excludeList: [],
				} ),
				getNode: ( path: string ) => {
					if ( path === '/sql' ) {
						return { checkState: sqlState };
					}
					if ( path === '/wp-content' || path === '/wp-config.php' ) {
						return { checkState: 'unchecked' };
					}
					return null;
				},
				setNodeCheckState: ( path: string, next: string ) => {
					if ( path === '/sql' ) {
						setSqlState( next );
					}
				},
			};

			return createElement(
				FileBrowserContext.Provider,
				{ value: { fileBrowserState } },
				children
			);
		};

		const useFileBrowserContext = () => useContext( FileBrowserContext );

		return { FileBrowserProvider, useFileBrowserContext };
	}
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

// Test helper to render the modal with defaults and return a fresh user instance
const setup = ( props = {} ) => {
	const utils = render( <StagingSiteSyncModal { ...defaultProps } { ...props } /> );
	const user = userEvent.setup();
	return { user, ...utils };
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

describe( 'Warnings', () => {
	test( 'database checkbox shows warning when checked', async () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		const { user } = setup();

		const databaseCheckbox = screen.getByLabelText( 'Database' );
		expect( databaseCheckbox ).toBeInTheDocument();

		expect(
			screen.queryByText( /Warning! Database will be overwritten/i )
		).not.toBeInTheDocument();

		await user.click( databaseCheckbox );

		await waitFor( () => {
			expect( screen.getByText( /Warning! Database will be overwritten/i ) ).toBeInTheDocument();
		} );

		expect( screen.getByText( /overwrite the site database/i ) ).toBeInTheDocument();
	} );

	test( 'shows WooCommerce warning when syncing WooCommerce site to production', async () => {
		const siteWithWoo = createMockSite( { options: { woocommerce_is_active: true } } );
		const stagingSiteWithWoo = createMockStagingSite( {
			options: { woocommerce_is_active: true },
		} );

		mockUseQuery( siteWithWoo, stagingSiteWithWoo );

		const { user } = setup( { syncType: 'push', environment: 'staging' } );

		const databaseCheckbox = screen.getByLabelText( 'Database' );

		await user.click( databaseCheckbox );

		await waitFor( () => {
			expect( screen.getByText( /WooCommerce installed/i ) ).toBeInTheDocument();
		} );
	} );
} );
describe( 'Form Submission', () => {
	test( 'submit button is disabled when domain confirmation is required but not provided', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'push', environment: 'staging' } );

		const submitButton = screen.getByRole( 'button', { name: 'Push' } );
		expect( submitButton ).toBeDisabled();
	} );

	test( 'submit button is enabled when domain confirmation matches', async () => {
		const useRewindableActivityLogQuery = require( '../../../../data/activity-log/use-rewindable-activity-log-query' );
		useRewindableActivityLogQuery.mockReturnValue( { data: undefined, isLoading: false } );
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'push', environment: 'staging' } );

		const modal = screen.getByRole( 'dialog' );
		const domainInput = within( modal ).getByLabelText( 'Type the site domain to confirm' );
		const user = userEvent.setup();
		const submitButton = within( modal ).getByRole( 'button', { name: 'Push' } );
		expect( submitButton ).toBeDisabled();

		await user.type( domainInput, 'test-site' );

		expect( domainInput ).toHaveValue( 'test-site' );
		expect( submitButton ).toBeEnabled();
	} );

	test( 'renders pull button for pull from staging', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'pull', environment: 'production' } );

		expect( screen.getByRole( 'button', { name: 'Pull' } ) ).toBeInTheDocument();
	} );

	test( 'renders push button for push to production', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { syncType: 'push', environment: 'staging' } );

		expect( screen.getByRole( 'button', { name: 'Push' } ) ).toBeInTheDocument();
	} );

	test( 'submits with expected options on push to production', async () => {
		const useRewindableActivityLogQuery = require( '../../../../data/activity-log/use-rewindable-activity-log-query' );
		useRewindableActivityLogQuery.mockReturnValue( { data: undefined, isLoading: false } );
		const prod = createMockSite( { slug: 'test-site' } );
		const stag = createMockStagingSite();
		mockUseQuery( prod, stag );
		const { user } = setup( { syncType: 'push', environment: 'staging' } );

		const modal = screen.getByRole( 'dialog' );
		await user.type(
			within( modal ).getByLabelText( 'Type the site domain to confirm' ),
			'test-site'
		);

		const { useMutation } = require( '@tanstack/react-query' );
		const submitMutation = useMutation().mutate;
		await user.click( within( modal ).getByRole( 'button', { name: 'Push' } ) );

		expect( submitMutation ).toHaveBeenCalledWith(
			expect.objectContaining( { types: 'paths', include_paths: '', exclude_paths: '' } ),
			expect.any( Object )
		);
	} );
} );

describe( 'Modal Actions', () => {
	test( 'calls onClose when cancel button is clicked', async () => {
		const onCloseMock = jest.fn();
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal( { onClose: onCloseMock } );

		const cancelButton = screen.getByRole( 'button', { name: 'Cancel' } );
		const user = userEvent.setup();

		await user.click( cancelButton );

		expect( onCloseMock ).toHaveBeenCalled();
	} );

	test( 'renders close button in modal header', () => {
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal();

		expect( screen.getByLabelText( 'Close' ) ).toBeInTheDocument();
	} );
} );

describe( 'Loading States', () => {
	test( 'shows busy state on submit button when mutation is pending', () => {
		mockUseMutation( { isPending: true } );
		mockUseQuery( createMockSite(), createMockStagingSite() );

		renderModal();

		const submitButton = screen.getByRole( 'button', { name: 'Pull' } );
		expect( submitButton ).toBeDisabled();
	} );
} );

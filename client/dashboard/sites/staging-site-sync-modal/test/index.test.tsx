/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import StagingSiteSyncModal from '../index';
import type { Site } from '@automattic/api-core';

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
		const { createContext, useContext, createElement, useState } = require( 'react' );

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
				addChildNodes: () => {},
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

const defaultProps = {
	onClose: jest.fn(),
	syncType: 'pull' as const,
	environment: 'production' as const,
	productionSiteId: 1,
	stagingSiteId: 2,
	onSyncStart: jest.fn(),
};

function mockSite( site: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }` )
		.query( true )
		.reply( 200, site );
}

function mockBackupContents() {
	nock( 'https://public-api.wordpress.com:443' )
		.post( /\/wpcom\/v2\/sites\/\d+\/rewind\/backup\/ls/ )
		.reply( 200, { ok: true, files: [] } )
		.persist();
}

describe( 'StagingSiteSyncModal', () => {
	describe( 'Component Rendering', () => {
		test( 'renders modal with correct title for pull from staging', () => {
			mockSite( createMockSite() );
			mockSite( createMockStagingSite() );
			mockBackupContents();
			render(
				<StagingSiteSyncModal { ...defaultProps } syncType="pull" environment="production" />
			);

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Pull from Staging' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for push to production', () => {
			mockSite( createMockSite() );

			mockSite( createMockStagingSite() );
			mockBackupContents();
			render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Push to Production' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for pull from production', () => {
			mockSite( createMockSite() );
			mockSite( createMockStagingSite() );
			mockBackupContents();
			render( <StagingSiteSyncModal { ...defaultProps } syncType="pull" environment="staging" /> );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Pull from Production' ) ).toBeInTheDocument();
		} );

		test( 'renders modal with correct title for push to staging', () => {
			mockSite( createMockSite() );
			mockSite( createMockStagingSite() );
			mockBackupContents();
			render(
				<StagingSiteSyncModal { ...defaultProps } syncType="push" environment="production" />
			);

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Push to Staging' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'File and Database Selection', () => {
		test( 'renders files and folders checkbox', () => {
			mockSite( createMockSite() );
			mockSite( createMockStagingSite() );
			mockBackupContents();
			render( <StagingSiteSyncModal { ...defaultProps } /> );

			expect( screen.getByLabelText( 'Files and folders' ) ).toBeInTheDocument();
		} );

		test( 'renders database checkbox', () => {
			mockSite( createMockSite() );
			mockSite( createMockStagingSite() );
			mockBackupContents();
			render( <StagingSiteSyncModal { ...defaultProps } /> );

			expect( screen.getByLabelText( 'Database' ) ).toBeInTheDocument();
		} );
	} );
} );

describe( 'File Selection', () => {
	test( 'renders file selection mode dropdown', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Select files and folders to sync' ) ).toBeInTheDocument();
	} );
} );

describe( 'Domain Confirmation', () => {
	test( 'shows domain confirmation field when syncing to production', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );

		expect( screen.getByLabelText( 'Type the site domain to confirm' ) ).toBeInTheDocument();
	} );

	test( 'does not show domain confirmation when not syncing to production', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="production" /> );

		expect( screen.queryByLabelText( 'Type the site domain to confirm' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'Warnings', () => {
	test( 'database checkbox shows warning when checked', async () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } /> );
		const user = userEvent.setup();

		const databaseCheckbox = screen.getByLabelText( 'Database' );
		expect( databaseCheckbox ).toBeInTheDocument();

		expect(
			screen.queryByText( /Warning! Database will be overwritten/i )
		).not.toBeInTheDocument();

		await user.click( databaseCheckbox );

		expect( await screen.findByText( /Warning! Database will be overwritten/i ) ).toBeVisible();
		expect( await screen.findByText( /overwrite the site database/i ) ).toBeVisible();
	} );

	test( 'shows WooCommerce warning when syncing WooCommerce site to production', async () => {
		const siteWithWoo = createMockSite( { options: { woocommerce_is_active: true } } );
		const stagingSiteWithWoo = createMockStagingSite( {
			options: { woocommerce_is_active: true },
		} );

		mockSite( siteWithWoo );
		mockSite( stagingSiteWithWoo );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );
		const user = userEvent.setup();

		const databaseCheckbox = screen.getByLabelText( 'Database' );

		await user.click( databaseCheckbox );

		expect( await screen.findByText( /WooCommerce installed/i ) ).toBeVisible();
	} );
} );

describe( 'Form Submission', () => {
	test( 'submit button is disabled when domain confirmation is required but not provided', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );

		const submitButton = screen.getByRole( 'button', { name: 'Push' } );
		expect( submitButton ).toBeDisabled();
	} );

	test( 'submit button is enabled when domain confirmation matches', async () => {
		const useRewindableActivityLogQuery = require( '../../../../data/activity-log/use-rewindable-activity-log-query' );
		useRewindableActivityLogQuery.mockReturnValue( { data: undefined, isLoading: false } );

		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );

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
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="pull" environment="production" /> );

		expect( screen.getByRole( 'button', { name: 'Pull' } ) ).toBeInTheDocument();
	} );

	test( 'renders push button for push to production', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );

		expect( screen.getByRole( 'button', { name: 'Push' } ) ).toBeInTheDocument();
	} );

	test( 'submits with expected options on push to production', async () => {
		const useRewindableActivityLogQuery = require( '../../../../data/activity-log/use-rewindable-activity-log-query' );
		useRewindableActivityLogQuery.mockReturnValue( { data: undefined, isLoading: false } );
		const prod = createMockSite( { slug: 'test-site' } );
		const stag = createMockStagingSite();

		// syncType: 'push', environment: 'staging' → uses pullFromStaging endpoint
		const scope = nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/sites/1/staging-site/pull-from-staging/2' )
			.reply( 200, {} );

		mockSite( prod );
		mockSite( stag );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } syncType="push" environment="staging" /> );
		const user = userEvent.setup();

		const modal = screen.getByRole( 'dialog' );
		await user.type(
			within( modal ).getByLabelText( 'Type the site domain to confirm' ),
			'test-site'
		);

		await user.click( within( modal ).getByRole( 'button', { name: 'Push' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );
} );

describe( 'Modal Actions', () => {
	test( 'calls onClose when cancel button is clicked', async () => {
		const onCloseMock = jest.fn();

		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } onClose={ onCloseMock } /> );

		const cancelButton = screen.getByRole( 'button', { name: 'Cancel' } );
		const user = userEvent.setup();

		await user.click( cancelButton );

		expect( onCloseMock ).toHaveBeenCalled();
	} );

	test( 'renders close button in modal header', () => {
		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Close' ) ).toBeInTheDocument();
	} );
} );

describe( 'Loading States', () => {
	test( 'shows busy state on submit button when mutation is pending', async () => {
		// Start a pull mutation that stays pending
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/wpcom/v2/sites/1/staging-site/pull-from-staging/2' )
			.reply( 200, {} );

		mockSite( createMockSite() );
		mockSite( createMockStagingSite() );
		mockBackupContents();
		render( <StagingSiteSyncModal { ...defaultProps } /> );
		const user = userEvent.setup();

		await user.click( screen.getByRole( 'button', { name: 'Pull' } ) );

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Pull' } ) ).toBeDisabled();
		} );
	} );
} );

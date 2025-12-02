/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import BackupCard from '../index';
import type { Site, ActivityLogsData } from '@automattic/api-core';

const mockSiteId = 123;

const mockFetchSiteActivityLog = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSiteActivityLog: ( ...args: unknown[] ) => mockFetchSiteActivityLog( ...args ),
} ) );

const mockSite: Site = {
	ID: mockSiteId,
	plan: {
		features: {
			active: [ HostingFeatures.BACKUPS ],
		},
	},
	is_wpcom_atomic: true,
} as Site;

jest.mock( '../../../app/auth', () => ( {
	useAuth: () => mockSite,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: ( text: string ) => text,
} ) );

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
} ) );

afterEach( () => {
	jest.clearAllMocks();
} );

describe( 'BackupCard', () => {
	test( 'shows "No backups yet" when there are no backups', async () => {
		mockFetchSiteActivityLog.mockResolvedValue( {
			activityLogs: [],
			totalItems: 0,
			pages: 0,
			itemsPerPage: 0,
			totalPages: 0,
		} as ActivityLogsData );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'No backups yet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Your first backup will be ready soon.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows successful backup information', async () => {
		const twoHoursAgo = new Date( Date.now() - 2 * 60 * 60 * 1000 ).toISOString();

		mockFetchSiteActivityLog.mockResolvedValue( {
			activityLogs: [
				{
					id: '1',
					activity_id: '1',
					name: 'rewind__backup_complete_full',
					published: twoHoursAgo,
					status: 'success',
				},
			],
			totalItems: 1,
			pages: 1,
			itemsPerPage: 1,
			totalPages: 1,
		} as ActivityLogsData );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( '2h ago' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Backup failed' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'shows failed backup with last successful backup time', async () => {
		mockFetchSiteActivityLog
			.mockResolvedValueOnce( {
				activityLogs: [
					{
						id: '2',
						activity_id: '2',
						name: 'rewind__backup_error',
						published: new Date().toISOString(),
						status: 'error',
					},
				],
				totalItems: 1,
				pages: 1,
				itemsPerPage: 1,
				totalPages: 1,
			} as ActivityLogsData )
			.mockResolvedValueOnce( {
				activityLogs: [
					{
						id: '1',
						activity_id: '1',
						name: 'rewind__backup_complete_full',
						published: new Date( Date.now() - 3 * 24 * 60 * 60 * 1000 ).toISOString(), // 3 days ago
						status: 'success',
					},
				],
				totalItems: 1,
				pages: 1,
				itemsPerPage: 1,
				totalPages: 1,
			} as ActivityLogsData );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Backup failed' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Last successful backup was 3d ago.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows "No successful backups found" when backup failed and no successful backup exists', async () => {
		mockFetchSiteActivityLog
			.mockResolvedValueOnce( {
				activityLogs: [
					{
						id: '2',
						activity_id: '2',
						name: 'rewind__backup_error',
						published: new Date().toISOString(),
						status: 'error',
					},
				],
				totalItems: 1,
				pages: 1,
				itemsPerPage: 1,
				totalPages: 1,
			} as ActivityLogsData )
			.mockResolvedValueOnce( {
				activityLogs: [],
				totalItems: 0,
				pages: 0,
				itemsPerPage: 0,
				totalPages: 0,
			} as ActivityLogsData );

		render( <BackupCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Backup failed' ) ).toBeInTheDocument();
			expect( screen.getByText( 'No successful backups found.' ) ).toBeInTheDocument();
		} );
	} );
} );

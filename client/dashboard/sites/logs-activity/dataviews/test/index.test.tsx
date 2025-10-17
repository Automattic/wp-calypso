/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SiteActivityLogsDataViews from '../index';
import type { Site } from '@automattic/api-core';
import type { DeepPartial } from 'utility-types';

const mockNavigate = jest.fn();
const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

jest.mock( '../../../../app/auth', () => ( {
	useAuth: () => ( {
		user: { id: 'test-user' },
	} ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
	useRegistry: () => ( {} ),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	store: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: ( text: string ) => text,
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useRouter: () => ( {
		navigate: mockNavigate,
		state: {
			location: {
				pathname: '/',
				search: '',
				hash: '',
				href: '/',
			},
		},
	} ),
} ) );

jest.mock( '../../../../app/router/sites', () => ( {
	siteBackupDetailRoute: {
		fullPath: '/sites/$siteSlug/backups/$rewindId',
	},
} ) );

const mockSite: DeepPartial< Site > = {
	ID: mockSiteId,
	slug: 'test-site',
};

const mockActivityLogsData = {
	activityLogs: [
		{
			summary: 'Plugin updated',
			content: {
				text: 'Jetpack 15.1',
				ranges: [
					{
						type: 'plugin',
						indices: [ 0, 12 ],
						id: '2',
						parent: null,
						slug: 'jetpack',
						version: '15.1',
						site_slug: 'testsite-slug',
					},
				],
			},
			name: 'plugin__updated',
			actor: {
				type: 'Person',
				name: 'Server',
				external_user_id: -1,
				wpcom_user_id: -1,
				icon: {
					type: 'Image',
					url: 'https://secure.gravatar.com/avatar/bb916f3b04845914b0ab60201e5e440bbf6fa99465af2f0beccec7a52e234559?s=96&d=identicon&r=g',
					width: 96,
					height: 96,
				},
				role: '',
			},
			type: 'Update',
			published: '2025-10-09T15:36:47.531+00:00',
			generator: {
				jetpack_version: 15.1,
				blog_id: 999999999999,
			},
			is_rewindable: false,
			rewind_id: '12345678990.123',
			base_rewind_id: null,
			rewind_step_count: 0,
			gridicon: 'plugins',
			status: 'success',
			activity_id: 'test-123456789',
			items: [
				{
					type: 'Plugin',
					name: 'Jetpack',
					object_version: '15.1',
					object_slug: 'jetpack/jetpack.php',
					object_previous_version: '15.0.2',
				},
			],
			totalItems: 1,
			is_discarded: false,
		},
		{
			activity_id: 'activity-1',
			is_rewindable: true,
			rewind_id: 'rewind-123',
			summary: 'Backup completed',
			published: '2023-01-01T12:00:00Z.531+00:00',
			content: { text: 'Backup content' },
			actor: { name: 'System' },
		},
	],
	totalItems: 2,
	totalPages: 1,
};

function renderActivityLogsDataViews() {
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity` )
		.query( true )
		.reply( 200, {
			current: {
				orderedItems: mockActivityLogsData.activityLogs,
			},
			totalItems: mockActivityLogsData.totalItems,
			totalPages: mockActivityLogsData.totalPages,
		} );

	return render(
		<SiteActivityLogsDataViews
			gmtOffset={ -8 }
			timezoneString="America/Los_Angeles"
			site={ mockSite as Site }
			dateRange={ { start: new Date(), end: new Date() } }
			autoRefresh={ false }
			setAutoRefresh={ jest.fn() }
			logType="activity"
			hasActivityLogsAccess
		/>
	);
}

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
} );

beforeAll( () => {
	nock.disableNetConnect();
} );

afterAll( () => {
	nock.enableNetConnect();
} );

test( 'clicking backup action navigates to backup detail page', async () => {
	const user = userEvent.setup();
	renderActivityLogsDataViews();

	await waitFor(
		() => {
			expect( screen.getByText( 'Backup completed' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const backupButton = screen.getByRole( 'button', { name: /See restore point/i } );
	await user.click( backupButton );

	expect( mockNavigate ).toHaveBeenCalledWith( {
		to: '/sites/$siteSlug/backups/$rewindId',
		params: {
			siteSlug: 'test-site',
			rewindId: 'rewind-123',
		},
	} );
} );

test( 'data is properly displayed', async () => {
	renderActivityLogsDataViews();

	await waitFor(
		() => {
			expect( screen.getByText( 'Backup completed' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	expect( screen.getByText( 'Plugin updated' ) ).toBeInTheDocument();

	// plugin update date formatting
	expect( screen.getByText( 'Oct 9, 2025 at 8:36 AM' ) ).toBeInTheDocument();

	// actor
	expect( screen.getByText( 'Server' ) ).toBeInTheDocument();

	// actor avatar
	expect( screen.getByAltText( 'Server' ) ).toHaveAttribute(
		'src',
		'https://secure.gravatar.com/avatar/bb916f3b04845914b0ab60201e5e440bbf6fa99465af2f0beccec7a52e234559?s=96&d=identicon&r=g'
	);
	// check the link
	expect( screen.getByRole( 'link', { name: 'Jetpack 15.1' } ) ).toHaveAttribute(
		'href',
		'/plugins/jetpack/testsite-slug'
	);
} );

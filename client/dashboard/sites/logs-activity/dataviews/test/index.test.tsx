/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SiteActivityLogsDataViews from '../index';
import type { Site, LogType } from '@automattic/api-core';
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
			activity_id: 'activity-1',
			is_rewindable: true,
			rewind_id: 'rewind-123',
			summary: 'Backup completed',
			published: '2023-01-01T12:00:00Z',
			content: { text: 'Backup content' },
			actor: { name: 'System' },
		},
	],
	totalItems: 1,
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
			logType={ 'activity' as typeof LogType.ACTIVITY }
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

	const backupButton = screen.getByRole( 'button', { name: /backup/i } );
	await user.click( backupButton );

	expect( mockNavigate ).toHaveBeenCalledWith( {
		to: '/sites/$siteSlug/backups/$rewindId',
		params: {
			siteSlug: 'test-site',
			rewindId: 'rewind-123',
		},
	} );
} );

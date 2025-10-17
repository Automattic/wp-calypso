/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { BackupsListPage } from '../index';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

jest.mock( '../../../app/auth', () => ( {
	useAuth: () => ( {
		user: { id: 'test-user' },
	} ),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: jest.fn(),
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

// Mock scrollIntoView for JSDOM compatibility
Element.prototype.scrollIntoView = jest.fn();

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: ( text: string ) => text,
} ) );

jest.mock(
	'../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: () => ( {
					includeList: [],
					excludeList: [],
					totalItems: 0,
				} ),
			},
			locale: 'en',
			notices: {
				showError: jest.fn(),
				showSuccess: jest.fn(),
			},
		} ),
	} )
);

const mockRouterParams = { siteSlug: 'test-site', rewindId: 'rewind-123' };

jest.mock( '@tanstack/react-router', () => {
	const actual = jest.requireActual( '@tanstack/react-router' );

	return {
		...actual,
		useParams: jest.fn( () => {
			return mockRouterParams;
		} ),
	};
} );

const mockSite: Site = {
	ID: mockSiteId,
	slug: 'test-site',
	name: 'Test Site',
	plan: {
		expired: false,
		features: {
			active: [ HostingFeatures.BACKUPS ],
		},
	},
	is_wpcom_atomic: true,
} as Site;

const mockBackupEntries = [
	{
		activity_id: '1',
		rewind_id: 'rewind-111',
		summary: 'First backup completed successfully',
		content: { text: 'First backup details' },
		published: '2025-09-21T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
	{
		activity_id: '2',
		rewind_id: 'rewind-123',
		summary: 'Daily backup completed successfully',
		content: { text: 'Daily backup details' },
		published: '2025-09-23T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
	{
		activity_id: '3',
		rewind_id: 'rewind-456',
		summary: 'Third backup completed successfully',
		content: { text: 'Third backup details' },
		published: '2025-09-24T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
	{
		activity_id: '4',
		rewind_id: 'rewind-789',
		summary: 'Fourth backup completed successfully',
		content: { text: 'Fourth backup details' },
		published: '2025-09-25T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
	{
		activity_id: '5',
		rewind_id: 'rewind-999',
		summary: 'Fifth backup completed successfully',
		content: { text: 'Fifth backup details' },
		published: '2025-09-26T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
] as unknown as ActivityLogEntry[];

const summaryTestCases: ReadonlyArray< readonly [ string, string ] > = [
	[ 'rewind-123', 'Daily backup completed successfully' ],
	[ 'rewind-456', 'Third backup completed successfully' ],
];

jest.mock( '../../../app/router/sites', () => ( {
	siteRoute: {
		useParams: () => ( { siteSlug: 'test-site' } ),
	},
} ) );

function renderBackupsListPage( {
	backupEntries = mockBackupEntries,
	activityLogTimes = 2,
}: {
	backupEntries?: ActivityLogEntry[];
	activityLogTimes?: number;
} = {} ) {
	nock( API_BASE ).get( '/rest/v1.1/sites/test-site' ).query( true ).reply( 200, mockSite );

	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ mockSiteId }/settings` )
		.reply( 200, {
			settings: {
				gmt_offset: 0,
				timezone_string: '',
			},
		} );

	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity/rewindable` )
		.query( true )
		.times( activityLogTimes )
		.reply( 200, {
			current: {
				orderedItems: backupEntries,
			},
			totalItems: backupEntries.length,
			totalPages: 1,
		} );

	return render( <BackupsListPage /> );
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

test.each( summaryTestCases )(
	'renders the details section correctly for rewindId %s',
	async ( rewindId, summary ) => {
		mockRouterParams.rewindId = rewindId;
		renderBackupsListPage();

		await waitFor( () => {
			expect( screen.getAllByText( summary ) ).toHaveLength( 2 );
		} );
	}
);

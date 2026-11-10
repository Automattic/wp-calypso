/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { useSearch } from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { BackupsPage } from '../backups-page';
import { BackupsListPage } from '../index';
import type { ActivityLogEntry, Site } from '@automattic/api-core';
import type { ReactElement } from 'react';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

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
	keyedReducer: () => () => ( {} ),
} ) );

// Mock scrollIntoView for JSDOM compatibility
Element.prototype.scrollIntoView = jest.fn();

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: jest.requireActual( '@wordpress/i18n' ).sprintf,
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
			active: [ HostingFeatures.BACKUPS_SELF_SERVE ],
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
	siteBackupsRoute: {
		useSearch: () => ( {} ),
	},
	siteBackupsIndexRoute: {
		fullPath: '/sites/$siteSlug/backups/',
	},
} ) );

function renderBackupsListPage(
	{
		backupEntries = mockBackupEntries,
		activityLogTimes = 2,
		timezoneString = '',
		requests = [],
	}: {
		backupEntries?: ActivityLogEntry[];
		activityLogTimes?: number;
		timezoneString?: string;
		requests?: Record< string, unknown >[];
	} = {},
	page: ReactElement = <BackupsListPage />
) {
	nock( API_BASE ).get( '/rest/v1.1/sites/test-site' ).query( true ).reply( 200, mockSite );

	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ mockSiteId }/settings` )
		.reply( 200, {
			settings: {
				gmt_offset: 0,
				timezone_string: timezoneString,
			},
		} );

	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity/rewindable` )
		.query( ( query ) => {
			requests.push( { kind: 'entries', ...query } );
			return true;
		} )
		.times( activityLogTimes )
		.reply( 200, {
			current: {
				orderedItems: backupEntries,
			},
			totalItems: backupEntries.length,
			totalPages: 1,
		} );
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ mockSiteId }/activity/rewindable/count/group` )
		.query( ( query ) => {
			requests.push( { kind: 'counts', ...query } );
			return true;
		} )
		.reply( 200, { groups: {} } );

	nock( API_BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	return render( page );
}

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

// Exercise the shared page with live router search, used by both site and agency wrappers.
function RoutedBackupsPage() {
	const searchParams = useSearch( { strict: false } );
	return (
		<BackupsPage
			site={ mockSite }
			searchParams={ searchParams }
			navigation={ {
				listPath: '/',
				selectBackup: () => {},
				requestRestore: () => {},
				requestDownload: () => {},
			} }
		/>
	);
}

test.each( [
	[ 'America/New_York', '2025-01-01T05:00:00Z', '2025-01-03T04:59:59Z' ],
	[ 'Asia/Tokyo', '2024-12-31T15:00:00Z', '2025-01-02T14:59:59Z' ],
] )(
	'keeps Backups entries and counts on selected site days in %s',
	async ( timezoneString, after, before ) => {
		window.history.replaceState(
			{ __TSR_index: 3 },
			'',
			`/?from=${ Date.parse( after ) / 1000 }&to=${ Date.parse( before ) / 1000 }`
		);
		const requests: Record< string, unknown >[] = [];
		renderBackupsListPage( { timezoneString, requests }, <RoutedBackupsPage /> );
		await waitFor( () => {
			for ( const kind of [ 'entries', 'counts' ] ) {
				expect( requests ).toContainEqual(
					expect.objectContaining( {
						kind,
						after: '2025-01-01 00:00:00',
						before: '2025-01-02 23:59:59',
					} )
				);
			}
		} );
		expect( screen.getByRole( 'button', { name: /^Date range:/ } ) ).toHaveAccessibleName(
			expect.stringContaining( 'Jan 1, 2025' )
		);
	}
);

test( 'replaces Backups page 2 and dates together without a follow-up history push', async () => {
	HTMLElement.prototype.scrollTo = () => {};
	window.history.replaceState( { __TSR_index: 3 }, '', '/?keep=present' );
	const backupEntries = Array.from( { length: 21 }, ( _, index ) => ( {
		...mockBackupEntries[ 0 ],
		activity_id: String( index ),
		rewind_id: `backup-${ index }`,
	} ) );
	const { router } = renderBackupsListPage( { backupEntries }, <RoutedBackupsPage /> );
	await userEvent.click( await screen.findByRole( 'button', { name: 'Next page' } ) );
	await waitFor( () =>
		expect( new URLSearchParams( router.state.location.searchStr ).get( 'page' ) ).toBe( '2' )
	);
	const index = router.state.location.state.__TSR_index;
	const length = window.history.length;
	await userEvent.click( screen.getByRole( 'button', { name: /^Date range:/ } ) );
	await userEvent.click( screen.getByRole( 'option', { name: 'Last 7 days' } ) );
	await waitFor( () =>
		expect( new URLSearchParams( router.state.location.searchStr ).get( 'page' ) ).toBeNull()
	);
	expect( router.state.location.search ).toMatchObject( {
		keep: 'present',
		from: expect.any( Number ),
		to: expect.any( Number ),
	} );
	expect( router.state.location.state.__TSR_index ).toBe( index );
	expect( window.history.length ).toBe( length );
} );

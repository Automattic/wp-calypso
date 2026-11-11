/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { speak } from '@wordpress/a11y';
import nock from 'nock';
import { render } from '../../../test-utils';
import { BackupsListPage } from '../index';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';
const siteId = 123;
const flaggedRewindId = '1792244435.274';
const cleanRewindId = '1792240000.5';

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: jest.fn(),
} ) );

// The live region would repeat the warning on the page.
jest.mock( '@wordpress/a11y', () => ( {
	...jest.requireActual( '@wordpress/a11y' ),
	speak: jest.fn(),
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

Element.prototype.scrollIntoView = jest.fn();

let mockSelectedFilesCount = 0;

jest.mock(
	'../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: () => ( {
					includeList: [],
					excludeList: [],
					totalItems: mockSelectedFilesCount,
				} ),
			},
			locale: 'en',
			notices: { showError: jest.fn(), showSuccess: jest.fn() },
		} ),
	} )
);

const mockRouterParams: { siteSlug: string; rewindId?: string } = { siteSlug: 'test-site' };

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useParams: jest.fn( () => mockRouterParams ),
} ) );

jest.mock( '../../../app/router/sites', () => ( {
	siteRoute: { useParams: () => ( { siteSlug: 'test-site' } ) },
	siteBackupsRoute: { useSearch: () => ( {} ) },
	siteBackupsIndexRoute: { fullPath: '/sites/$siteSlug/backups/' },
	siteBackupRestoreRoute: { fullPath: '/sites/$siteSlug/backups/$rewindId/restore' },
} ) );

const buildSite = ( withScan: boolean ) =>
	( {
		ID: siteId,
		slug: 'test-site',
		name: 'Test Site',
		plan: {
			expired: false,
			features: {
				active: [
					HostingFeatures.BACKUPS_SELF_SERVE,
					...( withScan ? [ HostingFeatures.SCAN_SELF_SERVE ] : [] ),
				],
			},
		},
		is_wpcom_atomic: true,
	} ) as Site;

const entries = [
	{
		activity_id: 'a1',
		rewind_id: flaggedRewindId,
		summary: 'Flagged backup',
		content: { text: 'Flagged backup details' },
		published: '2026-10-16T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
	{
		activity_id: 'a2',
		rewind_id: cleanRewindId,
		summary: 'Other backup',
		content: { text: 'Other backup details' },
		published: '2026-10-15T10:00:00Z',
		name: 'rewind__backup_complete_full',
		is_rewindable: true,
	},
] as unknown as ActivityLogEntry[];

const knownThreats = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

function renderPage( {
	withScan = false,
	backups,
	selected,
	latestWithout = 1792240000,
}: {
	withScan?: boolean;
	backups: unknown[];
	selected?: string;
	latestWithout?: number;
} ) {
	mockRouterParams.rewindId = selected;
	nock( API_BASE )
		.get( '/rest/v1.1/sites/test-site' )
		.query( true )
		.reply( 200, buildSite( withScan ) );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ siteId }/settings` )
		.reply( 200, { settings: { gmt_offset: 0, timezone_string: '' } } );
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/activity/rewindable` )
		.query( true )
		.times( 2 )
		.reply( 200, {
			current: { orderedItems: entries },
			totalItems: entries.length,
			totalPages: 1,
		} );
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ siteId }/activity/rewindable/count/group` )
		.query( true )
		.reply( 200, { groups: {} } );
	nock( API_BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
	const listScope = nock( API_BASE )
		.persist()
		.get( `/wpcom/v3/sites/${ siteId }/rewind/backups` )
		.query( true )
		.reply( 200, {
			ok: true,
			totalPages: 1,
			latest_without_known_threats: latestWithout,
			backups,
		} );
	return { ...render( <BackupsListPage /> ), listScope };
}

afterEach( () => {
	nock.cleanAll();
	mockSelectedFilesCount = 0;
} );

// No Activity Log mock, so the clean backup's completion time is unknown.
const fallbackRestoreLink = 'restore the latest backup without known threats';

const expectInOrder = ( ...elements: HTMLElement[] ) =>
	elements
		.slice( 1 )
		.forEach( ( element, index ) =>
			expect(
				elements[ index ].compareDocumentPosition( element ) & Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy()
		);

const localDate = ( utcMs: number ) =>
	new Intl.DateTimeFormat( 'en-US', { dateStyle: 'medium' } ).format( new Date( utcMs ) );

// The text of the smallest ancestor holding a backup title: the badge's own list row.
const closestRowText = ( element: HTMLElement ): string => {
	let node: HTMLElement | null = element;
	while ( node && ! /(Flagged|Other) backup/.test( node.textContent ?? '' ) ) {
		node = node.parentElement;
	}
	return node?.textContent ?? '';
};

const flaggedBackups = [
	{ object: { backup_period: '1792244301', known_threats: knownThreats( 3 ) } },
	{ object: { backup_period: 1792240000, known_threats: knownThreats( 0 ) } },
];

test( 'shows the badge on flagged backups in the list', async () => {
	renderPage( { backups: flaggedBackups } );

	const [ badge ] = await screen.findAllByText( 'Known threats (3)' );
	expect( badge ).toBeVisible();
	const warning =
		'This backup contains 3 known security threats and may restore malware on your site.';
	expect( badge.parentElement ).toHaveTextContent( warning );
	expect( badge ).not.toHaveAttribute( 'title' );
	expect( closestRowText( badge ) ).toContain( 'Flagged backup' );
	expect( closestRowText( badge ) ).not.toContain( 'Other backup' );
	expect(
		screen.queryAllByText( ( _, element ) => element?.textContent === 'Other backup' )
	).not.toHaveLength( 0 );
} );

test( 'shows the badge on realtime restore points inside a flagged backup', async () => {
	renderPage( {
		backups: [
			{ object: { backup_period: '1792244000', known_threats: knownThreats( 3 ) } },
			{ object: { backup_period: '1792230000', known_threats: knownThreats( 0 ) } },
		],
	} );

	const [ badge ] = await screen.findAllByText( 'Known threats (3)' );
	expect( badge ).toBeVisible();
	expect( closestRowText( badge ) ).toContain( 'Flagged backup' );
	expect( closestRowText( badge ) ).not.toContain( 'Other backup' );
	expect(
		screen.queryAllByText( ( _, element ) => element?.textContent === 'Other backup' )
	).not.toHaveLength( 0 );
} );

test( 'shows no badge before VaultPress ships', async () => {
	const consoleError = jest.spyOn( console, 'error' );
	const { listScope } = renderPage( {
		backups: [
			{ object: { backup_period: '1792244301' } },
			{ object: { backup_period: '1792240000' } },
		],
		selected: flaggedRewindId,
	} );

	expect( await screen.findAllByText( 'Flagged backup' ) ).not.toHaveLength( 0 );
	await waitFor( () => expect( listScope.isDone() ).toBe( true ) );
	expect( screen.queryByText( /Known threats/ ) ).not.toBeInTheDocument();
	expect( consoleError ).not.toHaveBeenCalled();
	consoleError.mockRestore();
} );

test( 'expands the threats list for Scan sites', async () => {
	const user = userEvent.setup();
	const threatsScope = nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/rewind/backups/1792244301/threats` )
		.reply( 200, {
			backup_id: 1792244301,
			cutoff: null,
			summary: { ...knownThreats( 3 ), vulnerable: 2 },
			count: 2,
			truncated: false,
			threats: [
				{
					id: 2,
					state: 'open',
					kind: 'malware',
					signature: 'Eicar.Test',
					path_kind: 'file',
					type: 'file',
					target: 'eicar-standard.php',
					path: 'wp-content/plugins/rf-known-threats-test/eicar-standard.php',
					status: 'new',
					reported_on: '2026-09-01 23:30:00',
					fixed_on: null,
				},
				{
					id: 1,
					state: 'fixed',
					kind: 'malware',
					signature: 'Backdoor.PHP.Agent',
					path_kind: 'file',
					type: 'file',
					target: 'wp-content/uploads/evil.php',
					status: null,
					reported_on: '2026-09-01 23:30:00',
					fixed_on: '2026-09-02 23:30:00',
				},
			],
		} );
	renderPage( { withScan: true, backups: flaggedBackups, selected: flaggedRewindId } );

	const summary = await screen.findByText( 'Threat details' );
	expect( summary.tagName ).toBe( 'SUMMARY' );
	const details = summary.closest( 'details' ) as HTMLElement;
	expect( details ).not.toHaveAttribute( 'open' );
	// The warning above already gives the count, so no badge sits in the summary.
	expect( within( details ).queryByText( 'Known threats (3)' ) ).not.toBeInTheDocument();
	// One sentence: the warning, then the link to the clean backup.
	const restoreLink = screen.getByRole( 'link', { name: fallbackRestoreLink } );
	expect( restoreLink ).toBeVisible();
	expect( restoreLink.parentElement ).toHaveTextContent(
		'This backup contains 3 known security threats and may restore malware on your site. Instead, restore the latest backup without known threats.'
	);
	expectInOrder( restoreLink, summary );
	await user.click( summary );

	expect( await screen.findByText( 'Backdoor.PHP.Agent' ) ).toBeVisible();
	expect( screen.getByRole( 'list', { name: 'Known threats in this backup' } ) ).toBeVisible();
	expectInOrder( summary, screen.getByRole( 'list', { name: 'Known threats in this backup' } ) );
	expect( screen.getByText( 'wp-content/uploads/evil.php' ) ).toBeVisible();
	expect(
		screen.getByText( 'wp-content/plugins/rf-known-threats-test/eicar-standard.php' )
	).toBeVisible();
	expect( screen.queryByText( 'eicar-standard.php' ) ).not.toBeInTheDocument();
	const reportedOn = localDate( Date.UTC( 2026, 8, 1, 23, 30 ) );
	expect( screen.getAllByText( new RegExp( `^First detected ${ reportedOn } · ` ) ) ).toHaveLength(
		2
	);
	expect(
		screen.getByText(
			`First detected ${ reportedOn } · Fixed ${ localDate( Date.UTC( 2026, 8, 2, 23, 30 ) ) }`
		)
	).toBeVisible();
	expect( screen.getByText( 'Also: 2 vulnerable plugin or theme versions.' ) ).toBeVisible();
	expect( screen.getAllByRole( 'link', { name: fallbackRestoreLink } ) ).toHaveLength( 1 );
	expect( screen.getByRole( 'link', { name: fallbackRestoreLink } ) ).toHaveAttribute(
		'href',
		expect.stringContaining( '/backups/1792240000/restore' )
	);
	expect( threatsScope.isDone() ).toBe( true );
	expect( details ).toHaveAttribute( 'open' );
} );

test( 'shows a loading, then failed, state inside the open threat details', async () => {
	const user = userEvent.setup();
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/rewind/backups/1792244301/threats` )
		.delay( 300 )
		.reply( 500, {} );
	renderPage( { withScan: true, backups: flaggedBackups, selected: flaggedRewindId } );

	const summary = await screen.findByText( 'Threat details' );
	const details = summary.closest( 'details' ) as HTMLElement;
	await user.click( summary );

	expect( details ).toContainElement( await screen.findByText( 'Loading threats…' ) );
	expect( details ).toContainElement(
		await screen.findByText( "Couldn't load the threats. Try again later." )
	);

	await user.click( summary );
	expect( details ).not.toHaveAttribute( 'open' );
} );

test( 'hides the restore link when the latest clean backup is this one', async () => {
	renderPage( {
		withScan: true,
		backups: flaggedBackups,
		selected: flaggedRewindId,
		// The selected activity (1792244435.274) belongs to the 1792244301 backup period.
		latestWithout: 1792244301,
	} );

	await screen.findByText( 'Threat details' );
	expect( screen.queryByRole( 'link', { name: /^restore the latest backup/ } ) ).toBeNull();
} );

test( 'uses the singular vulnerable note for one version', async () => {
	const user = userEvent.setup();
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/rewind/backups/1792244301/threats` )
		.reply( 200, {
			backup_id: 1792244301,
			cutoff: null,
			summary: { ...knownThreats( 3 ), vulnerable: 1 },
			count: 0,
			truncated: false,
			threats: [],
		} );
	renderPage( { withScan: true, backups: flaggedBackups, selected: flaggedRewindId } );

	await user.click( await screen.findByText( 'Threat details' ) );

	expect( await screen.findByText( 'Also: 1 vulnerable plugin or theme version.' ) ).toBeVisible();
} );

test( 'shows the count only without Scan', async () => {
	const threatsScope = nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/rewind/backups/1792244301/threats` )
		.reply( 200, {} );
	renderPage( { withScan: false, backups: flaggedBackups, selected: flaggedRewindId } );

	expect(
		await screen.findByText( /This backup contains 3 known security threats/ )
	).toBeVisible();
	await waitFor( () =>
		expect( screen.getAllByText( 'Known threats (3)' ).length ).toBeGreaterThan( 0 )
	);
	screen
		.getAllByText( 'Known threats (3)' )
		.forEach( ( badge ) => expect( badge.querySelector( 'svg' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'Threat details' ) ).not.toBeInTheDocument();
	expect( threatsScope.isDone() ).toBe( false );
} );

test( 'requires the acknowledgement before restoring a flagged backup from its details', async () => {
	const user = userEvent.setup();
	renderPage( { withScan: false, backups: flaggedBackups, selected: flaggedRewindId } );

	const checkbox = await screen.findByRole( 'checkbox', {
		name: 'I understand this backup contains known threats and want to restore it anyway.',
	} );
	const restore = screen.getByRole( 'button', { name: 'Restore to this point' } );
	expect( restore ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( restore ).toHaveAccessibleDescription(
		'To restore this backup, confirm that you understand it contains known threats.'
	);

	await user.click( checkbox );

	expect( restore ).toBeEnabled();
	expect( restore ).not.toHaveAttribute( 'aria-disabled' );
	expect( restore ).not.toHaveAccessibleDescription();
	// The button sits above the checkbox, so the announcement says where it is.
	expect(
		restore.compareDocumentPosition( checkbox ) & Node.DOCUMENT_POSITION_FOLLOWING
	).toBeTruthy();
	expect( speak ).toHaveBeenLastCalledWith(
		'You can now restore this backup with "Restore to this point", at the top of this panel.'
	);
} );

test( 'requires the acknowledgement before restoring selected files from its details', async () => {
	const user = userEvent.setup();
	mockSelectedFilesCount = 2;
	renderPage( { withScan: false, backups: flaggedBackups, selected: flaggedRewindId } );

	const checkbox = await screen.findByRole( 'checkbox', {
		name: 'I understand this backup contains known threats and want to restore it anyway.',
	} );
	const restore = screen.getByRole( 'button', { name: 'Restore selected files' } );
	expect( restore ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( restore ).toHaveAccessibleDescription(
		'To restore this backup, confirm that you understand it contains known threats.'
	);

	await user.click( checkbox );

	expect( restore ).toBeEnabled();
	expect( restore ).not.toHaveAttribute( 'aria-disabled' );
	expect( restore ).not.toHaveAccessibleDescription();
	expect( speak ).toHaveBeenLastCalledWith(
		'You can now restore this backup with "Restore selected files", at the top of this panel.'
	);
} );

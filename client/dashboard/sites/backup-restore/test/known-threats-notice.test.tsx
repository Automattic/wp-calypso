/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { useRouterState } from '@tanstack/react-router';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { speak } from '@wordpress/a11y';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteBackupRestoreForm from '../form';
import SiteBackupGranularRestoreForm from '../granular-form';
import type { Site } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';
const siteId = 123;
const rewindId = '1792244435.274';

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: jest.fn(),
} ) );

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

jest.mock(
	'../../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: () => ( { includeList: [], excludeList: [], totalItems: 1 } ),
				getSelectedList: () => [ { type: 'file', path: '/wp-content/a.php' } ],
			},
		} ),
	} )
);

jest.mock( '../../../app/router/sites', () => ( {
	siteRoute: { useParams: () => ( { siteSlug: 'test-site' } ) },
	siteBackupRestoreRoute: { fullPath: '/sites/$siteSlug/backups/$rewindId/restore' },
} ) );

const site = {
	ID: siteId,
	slug: 'test-site',
	name: 'Test Site',
	plan: {
		expired: false,
		features: { active: [ HostingFeatures.BACKUPS_SELF_SERVE, HostingFeatures.SCAN_SELF_SERVE ] },
	},
} as Site;

const knownThreats = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

function mockBackups(
	backup: Record< string, unknown >,
	latestWithout: number | null = 1792240000
) {
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v3/sites/${ siteId }/rewind/backups` )
		.query( true )
		.reply( 200, {
			ok: true,
			totalPages: 1,
			latest_without_known_threats: latestWithout,
			backups: [ { object: { backup_period: '1792244301', ...backup } } ],
		} );
	nock( API_BASE )
		.persist()
		.get( new RegExp( `/wpcom/v2/sites/${ siteId }/rewind/backups/.*/threats` ) )
		.reply( 503, {} );
	nock( API_BASE )
		.persist()
		.get( new RegExp( `/rest/v1.1/sites/${ siteId }/rewind/backups/.*` ) )
		.query( true )
		.reply( 200, {} );
	nock( API_BASE )
		.persist()
		.get( `/rest/v1.4/sites/${ siteId }/settings` )
		.query( true )
		.reply( 200, { settings: { timezone_string: 'UTC', gmt_offset: 0 } } );
	// The clean backup's "Backup complete" entry, a few minutes after its period.
	nock( API_BASE )
		.persist()
		.get( `/wpcom/v2/sites/${ siteId }/activity` )
		.query( true )
		.reply( 200, {
			current: {
				orderedItems: [
					{
						activity_id: 'backup-clean',
						name: 'rewind__backup_complete_full',
						rewind_id: '1792240135.5',
						is_rewindable: true,
						published: '2026-10-17T12:28:55.500+00:00',
						summary: 'Backup and scan complete',
						content: { text: '' },
						actor: { name: 'Jetpack' },
					},
				],
			},
			totalItems: 1,
			totalPages: 1,
		} );
}

const renderForm = () =>
	render(
		<SiteBackupRestoreForm
			site={ site }
			restoreLinkTo="/sites/$siteSlug/backups/$rewindId/restore"
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ jest.fn() }
		/>
	);

const restoreButton = () => screen.getByRole( 'button', { name: 'Restore now' } );

afterEach( () => {
	nock.cleanAll();
	jest.mocked( speak ).mockClear();
} );

test( 'disables Restore now until the box is ticked', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	const checkbox = await screen.findByRole( 'checkbox', {
		name: 'I understand this backup contains known threats and want to restore it anyway.',
	} );
	expect(
		screen.getByText(
			'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.'
		)
	).toBeVisible();
	expect( restoreButton() ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( restoreButton() ).toHaveAccessibleDescription(
		'To restore this backup, confirm that you understand it contains known threats.'
	);
	// Shown as text, not in a tooltip.
	expect(
		screen.getByText(
			'To restore this backup, confirm that you understand it contains known threats.'
		)
	).toBeVisible();

	await user.click( checkbox );
	expect( restoreButton() ).toBeEnabled();
	expect( restoreButton() ).not.toHaveAttribute( 'aria-disabled' );
	expect( restoreButton() ).not.toHaveAccessibleDescription();
	await user.hover( restoreButton() );
	expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();

	await user.click( checkbox );
	expect( restoreButton() ).toHaveAttribute( 'aria-disabled', 'true' );
} );

test( 'keeps the unacknowledged Restore now focusable but inert', async () => {
	const user = userEvent.setup();
	const onRestoreInitiate = jest.fn();
	const restoreScope = nock( API_BASE )
		.post( new RegExp( `/activity-log/${ siteId }/rewind/to/` ) )
		.query( true )
		.reply( 200, {} );
	mockBackups( { known_threats: knownThreats( 3 ) } );
	render(
		<SiteBackupRestoreForm
			site={ site }
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ onRestoreInitiate }
		/>
	);

	await screen.findByRole( 'checkbox', { name: /I understand/ } );
	restoreButton().focus();
	expect( restoreButton() ).toHaveFocus();
	await user.click( restoreButton() );
	await user.keyboard( '{Enter}' );

	expect( restoreScope.isDone() ).toBe( false );
	expect( onRestoreInitiate ).not.toHaveBeenCalled();

	await user.click( screen.getByRole( 'checkbox', { name: /I understand/ } ) );
	await user.click( restoreButton() );
	await waitFor( () => expect( restoreScope.isDone() ).toBe( true ) );
} );

test( 'announces the warning once when it appears', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	const sentence =
		'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.';
	await screen.findByText( sentence );
	expect( speak ).toHaveBeenCalledTimes( 1 );
	expect( speak ).toHaveBeenCalledWith( sentence );

	// Ticking the box says the restore is open, without repeating the warning; unticking says nothing.
	const checkbox = screen.getByRole( 'checkbox', { name: /I understand/ } );
	await user.click( checkbox );
	expect( speak ).toHaveBeenCalledTimes( 2 );
	expect( speak ).toHaveBeenLastCalledWith( 'You can now restore this backup.' );
	expect( checkbox ).toHaveFocus();

	await user.click( checkbox );
	expect( speak ).toHaveBeenCalledTimes( 2 );
} );

test( 'uses the singular for one threat', async () => {
	mockBackups( { known_threats: knownThreats( 1 ) } );
	renderForm();

	expect(
		await screen.findByText(
			'This backup is known to contain 1 security threat. Restoring it may bring malware back to your site.'
		)
	).toBeVisible();
} );

test( 'renders the sentence without a raw paragraph so it lines up with the notice icon', async () => {
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	const sentence = await screen.findByText(
		'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.'
	);
	expect( sentence.tagName ).not.toBe( 'P' );
	expect( sentence.closest( 'p' ) ).toBeNull();
	expect( sentence.closest( '.dashboard-notice__description' ) ).not.toBeNull();
} );

test( 'keeps other disabled reasons', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	await user.click(
		await screen.findByRole( 'checkbox', { name: /I understand this backup contains/ } )
	);
	expect( restoreButton() ).toBeEnabled();

	for ( const name of [
		'WordPress themes',
		'WordPress plugins',
		'WordPress root',
		'WP-content directory',
		'Site database',
		'Media uploads',
	] ) {
		await user.click( screen.getByRole( 'checkbox', { name: new RegExp( `^${ name }` ) } ) );
	}

	expect( restoreButton() ).toBeDisabled();
} );

test( 'does nothing for backups without known threats', async () => {
	mockBackups( { known_threats: knownThreats( 0 ) } );
	const scope = nock( API_BASE );
	renderForm();

	await act( () => new Promise( ( resolve ) => setTimeout( resolve, 200 ) ) );
	expect( screen.queryByText( /known to contain/ ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'checkbox', { name: /I understand/ } ) ).not.toBeInTheDocument();
	expect( restoreButton() ).toBeEnabled();
	scope.done();
} );

test( 'does nothing before VaultPress ships', async () => {
	const consoleError = jest.spyOn( console, 'error' );
	mockBackups( {}, null );
	renderForm();

	await act( () => new Promise( ( resolve ) => setTimeout( resolve, 200 ) ) );
	expect( screen.queryByText( /known to contain/ ) ).not.toBeInTheDocument();
	expect( restoreButton() ).toBeEnabled();
	expect( consoleError ).not.toHaveBeenCalled();
	consoleError.mockRestore();
} );

test( 'links to the latest backup without known threats', async () => {
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	const link = await screen.findByRole( 'link', {
		name: 'Restore Oct 17, 2026 at 12:28 PM backup instead',
	} );
	expect( link ).toHaveAttribute(
		'href',
		expect.stringContaining( '/backups/1792240000/restore' )
	);
	expect( link ).toHaveAccessibleDescription(
		"It's the most recent backup with no known security threats."
	);
	expect( link ).not.toHaveAttribute( 'title' );
	// Shown as text, not in a tooltip.
	expect(
		screen.getByText( "It's the most recent backup with no known security threats." )
	).toBeVisible();
} );

test( 'moves focus to the restore point after opening the clean backup', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	// Stands in for the restore route, whose rewind id comes from the URL.
	function RoutedForm() {
		const pathname = useRouterState( { select: ( state ) => state.location.pathname } );
		const opened = pathname.match( /\/backups\/(\d+)\/restore/ )?.[ 1 ];
		return (
			<SiteBackupRestoreForm
				site={ site }
				restoreLinkTo="/sites/$siteSlug/backups/$rewindId/restore"
				siteId={ siteId }
				rewindId={ opened ?? rewindId }
				restorePointDate={ opened ? 'Oct 17' : 'Oct 16' }
				onRestoreInitiate={ jest.fn() }
			/>
		);
	}
	render( <RoutedForm /> );

	const link = await screen.findByRole( 'link', { name: /^Restore .+ backup instead$/ } );
	expect( screen.getByText( /Choose what to restore/ ) ).not.toHaveFocus();
	await user.click( link );

	await waitFor( () => expect( screen.getByText( /Choose what to restore/ ) ).toHaveFocus() );
	expect( screen.getByText( /Choose what to restore/ ) ).toHaveTextContent( 'Oct 17' );
	expect( link ).not.toBeInTheDocument();
} );

test( 'shows the restore link once when the threats are expanded', async () => {
	const user = userEvent.setup();
	const threatsScope = nock( API_BASE )
		.get( `/wpcom/v2/sites/${ siteId }/rewind/backups/1792244301/threats` )
		.reply( 200, {
			backup_id: 1792244301,
			cutoff: null,
			summary: knownThreats( 3 ),
			count: 0,
			truncated: false,
			threats: [],
		} );
	mockBackups( { known_threats: knownThreats( 3 ) } );
	renderForm();

	const toggle = await screen.findByRole( 'button', { name: 'Show threats' } );
	expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
	expect( toggle.querySelector( 'svg' ) ).toBeInTheDocument();
	expect( toggle ).not.toHaveAccessibleDescription( 'Show threats' );
	await user.unhover( toggle );
	await user.click( toggle );

	expect(
		await screen.findByRole( 'list', { name: 'Known threats in this backup' } )
	).toBeVisible();
	const expanded = screen.getByRole( 'button', { name: 'Hide threats' } );
	expect( expanded ).toHaveAttribute( 'aria-expanded', 'true' );
	await user.unhover( expanded );
	expect( expanded ).not.toHaveAccessibleDescription( 'Hide threats' );
	expect(
		await screen.findAllByRole( 'link', { name: /^Restore .+ backup instead$/ } )
	).toHaveLength( 1 );
	expect( threatsScope.isDone() ).toBe( true );
} );

test( 'shows no Show threats toggle without Scan', async () => {
	mockBackups( { known_threats: knownThreats( 3 ) } );
	render(
		<SiteBackupRestoreForm
			site={ { ...site, plan: { ...site.plan, features: { active: [] } } } as Site }
			restoreLinkTo="/sites/$siteSlug/backups/$rewindId/restore"
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ jest.fn() }
		/>
	);

	expect( await screen.findByText( /known to contain 3/ ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: /show threats/i } ) ).not.toBeInTheDocument();
	expect( screen.getByRole( 'checkbox', { name: /I understand/ } ) ).toBeVisible();
} );

test( 'granular form requires the acknowledgement before restoring selected files', async () => {
	const user = userEvent.setup();
	const onRestoreInitiate = jest.fn();
	const restoreScope = nock( API_BASE )
		.post( new RegExp( `/activity-log/${ siteId }/rewind/to/` ) )
		.query( true )
		.reply( 200, { restore_id: '42' } );
	mockBackups( { known_threats: knownThreats( 3 ) } );
	render(
		<SiteBackupGranularRestoreForm
			site={ site }
			restoreLinkTo="/sites/$siteSlug/backups/$rewindId/restore"
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ onRestoreInitiate }
		/>
	);

	const checkbox = await screen.findByRole( 'checkbox', {
		name: 'I understand this backup contains known threats and want to restore it anyway.',
	} );
	const restore = screen.getByRole( 'button', { name: 'Restore selected file' } );
	expect( restore ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( restore ).toHaveAccessibleDescription(
		'To restore this backup, confirm that you understand it contains known threats.'
	);
	// Shown as text, not in a tooltip.
	expect(
		screen.getByText(
			'To restore this backup, confirm that you understand it contains known threats.'
		)
	).toBeVisible();

	await user.click( restore );
	expect( restoreScope.isDone() ).toBe( false );
	expect( onRestoreInitiate ).not.toHaveBeenCalled();

	await user.click( checkbox );
	expect( speak ).toHaveBeenLastCalledWith( 'You can now restore this backup.' );
	expect( restore ).toBeEnabled();
	expect( restore ).not.toHaveAttribute( 'aria-disabled' );
	expect( restore ).not.toHaveAccessibleDescription();

	await user.click( restore );
	await waitFor( () =>
		expect( onRestoreInitiate ).toHaveBeenCalledWith( 42, {
			known_threats_shown: true,
			known_threats_acknowledged: true,
		} )
	);
} );

test( 'renders no link when the caller supplies no restore route', async () => {
	mockBackups( { known_threats: knownThreats( 3 ) } );
	render(
		<SiteBackupRestoreForm
			site={ site }
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ jest.fn() }
		/>
	);

	expect( await screen.findByText( /known to contain 3/ ) ).toBeVisible();
	expect( screen.queryByRole( 'link', { name: /^Restore .+ instead$/ } ) ).not.toBeInTheDocument();
} );

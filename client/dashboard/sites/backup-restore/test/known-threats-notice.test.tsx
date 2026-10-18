/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockCreateErrorNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: mockCreateErrorNotice,
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
} );

const restorePath = `/rest/v1/activity-log/${ siteId }/rewind/to/${ rewindId }`;

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
	expect( restoreButton() ).toBeDisabled();

	await user.click( checkbox );
	expect( restoreButton() ).toBeEnabled();

	await user.click( checkbox );
	expect( restoreButton() ).toBeDisabled();
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

	expect(
		await screen.findByRole( 'link', { name: 'Restore Oct 17, 2026 - 12:28 PM backup instead' } )
	).toHaveAttribute( 'href', expect.stringContaining( '/backups/1792240000/restore' ) );
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

	const toggle = await screen.findByRole( 'button', { name: 'Known threats (3), show threats' } );
	expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
	expect( toggle.querySelector( 'svg' ) ).toBeInTheDocument();
	expect( screen.queryByRole( 'button', { name: 'Show threats' } ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'Show threats' ) ).not.toBeInTheDocument();
	await user.hover( toggle );
	expect( await screen.findByText( 'Show threats' ) ).toBeVisible();
	await user.unhover( toggle );
	await user.click( toggle );

	expect( await screen.findByRole( 'columnheader', { name: 'Threat' } ) ).toBeVisible();
	const expanded = screen.getByRole( 'button', { name: 'Known threats (3), hide threats' } );
	expect( expanded ).toHaveAttribute( 'aria-expanded', 'true' );
	await user.unhover( expanded );
	await user.hover( expanded );
	expect( await screen.findByText( 'Hide threats' ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Hide threats' } ) ).not.toBeInTheDocument();
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

test( 'granular form shows the notice without a checkbox', async () => {
	mockBackups( { known_threats: knownThreats( 3 ) } );
	render(
		<SiteBackupGranularRestoreForm
			site={ site }
			restoreLinkTo="/sites/$siteSlug/backups/$rewindId/restore"
			siteId={ siteId }
			rewindId={ rewindId }
			restorePointDate="Oct 16"
			onRestoreInitiate={ jest.fn() }
		/>
	);

	expect( await screen.findByText( /known to contain 3/ ) ).toBeVisible();
	await waitFor( () =>
		expect( screen.queryByRole( 'checkbox', { name: /I understand/ } ) ).not.toBeInTheDocument()
	);
	expect( screen.getByRole( 'button', { name: 'Restore selected file' } ) ).toBeEnabled();
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
	expect(
		screen.queryByRole( 'link', { name: /^Restore .+ backup instead$/ } )
	).not.toBeInTheDocument();
} );

describe( 'sends acknowledge_threats only when acknowledged', () => {
	test( 'sends it after the box is ticked', async () => {
		const user = userEvent.setup();
		mockBackups( { known_threats: knownThreats( 3 ) } );
		const scope = nock( API_BASE )
			.post( restorePath, ( body ) => {
				expect( body ).toEqual( expect.objectContaining( { acknowledge_threats: true } ) );
				return true;
			} )
			.reply( 200, { restore_id: '42' } );
		renderForm();

		await user.click( await screen.findByRole( 'checkbox', { name: /I understand/ } ) );
		await user.click( restoreButton() );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'omits it for backups without known threats', async () => {
		const user = userEvent.setup();
		mockBackups( { known_threats: knownThreats( 0 ) } );
		const scope = nock( API_BASE )
			.post( restorePath, ( body ) => {
				expect( body ).not.toHaveProperty( 'acknowledge_threats' );
				return true;
			} )
			.reply( 200, { restore_id: '42' } );
		renderForm();

		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 200 ) ) );
		await user.click( restoreButton() );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );

test( 'shows the known-threats message on threats_not_acknowledged', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	nock( API_BASE ).post( restorePath ).reply( 409, {
		error: 'threats_not_acknowledged',
		message: 'This backup contains known threats.',
	} );
	renderForm();

	const checkbox = await screen.findByRole( 'checkbox', { name: /I understand/ } );
	await user.click( checkbox );
	await user.click( restoreButton() );

	await waitFor( () =>
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'This backup is known to contain security threats. Acknowledge them to restore it.',
			expect.anything()
		)
	);
	expect( checkbox ).not.toBeChecked();
	expect( restoreButton() ).toBeDisabled();
} );

test( 'keeps the generic message for other restore errors', async () => {
	const user = userEvent.setup();
	mockBackups( { known_threats: knownThreats( 3 ) } );
	nock( API_BASE ).post( restorePath ).reply( 500, { error: 'server_error', message: 'Oops' } );
	renderForm();

	const checkbox = await screen.findByRole( 'checkbox', { name: /I understand/ } );
	await user.click( checkbox );
	await user.click( restoreButton() );

	await waitFor( () =>
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'Failed to initiate restore. Please try again.',
			expect.anything()
		)
	);
	expect( checkbox ).toBeChecked();
} );

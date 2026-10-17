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
const rewindId = '1792244294.123';

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
			backups: [ { object: { backup_period: '1792244294', ...backup } } ],
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

	expect( await screen.findByRole( 'link', { name: 'Restore that one instead' } ) ).toHaveAttribute(
		'href',
		expect.stringContaining( '/backups/1792240000/restore' )
	);
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
	expect( screen.queryByRole( 'button', { name: /Show threats/ } ) ).not.toBeInTheDocument();
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
		screen.queryByRole( 'link', { name: 'Restore that one instead' } )
	).not.toBeInTheDocument();
} );

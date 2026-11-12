/**
 * @jest-environment jsdom
 */

import { randomUUID } from 'node:crypto';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ShareAccessForm } from '..';
import { render } from '../../../../test-utils';
import AssistedIntro from '../../assisted-intro';
import { AssistedWordPressMigration } from '../../assisted-wordpress';
import { captureMigrationAuthorization, getMigrationAuthorizationUrl } from '../authorization';
import type { Site } from '@automattic/api-core';

const siteSlug = 'destination.wordpress.com';
const overviewPath = `/sites/${ siteSlug }/migration-overview`;
const shareAccessPath = `${ overviewPath }/share-access`;
const source = 'https://source.example.com/';
const api = 'https://public-api.wordpress.com';
const siteEndpoint = `/rest/v1.1/sites/${ siteSlug }`;
const site = {
	ID: 123,
	slug: siteSlug,
	name: 'Destination',
	site_migration: { type: 'assisted-wordpress', status_v2: 'pending' },
} as Site;

afterEach( () => {
	window.history.replaceState( null, '', '/' );
	window.sessionStorage.clear();
} );

function mockAuthorization() {
	return nock( api )
		.get( '/wpcom/v2/imports/analyze-url' )
		.query( { site_url: source } )
		.reply( 200, { platform: 'wordpress' } )
		.post( '/wpcom/v2/sites/123/automated-migration/application-passwords/setup', { source } )
		.query( true )
		.reply( 200, {
			authorization_url: `${ source }wp-admin/authorize-application.php?app_name=WordPress.com`,
		} );
}

function mockPendingSite( times = 1 ) {
	return nock( api ).get( siteEndpoint ).query( true ).times( times ).reply( 200, site );
}

const mockPost = ( path: string, body?: nock.RequestBodyMatcher ) =>
	nock( api ).post( path, body ).query( true );
const renderShareAccess = () => render( <ShareAccessForm site={ site } sourceUrl={ source } /> );
const expectOverview = ( router: ReturnType< typeof render >[ 'router' ] ) =>
	waitFor( () => expect( router.state.location.pathname ).toBe( overviewPath ) );

test( 'links a pending assisted migration to the Dashboard share access page', async () => {
	nock( api )
		.get( '/wpcom/v2/sites/123/wordpress-migration/status' )
		.query( true )
		.reply( 200, { source_url: source, findings: [] } );

	render( <AssistedWordPressMigration site={ site } /> );

	expect( await screen.findByRole( 'link', { name: 'Share access' } ) ).toHaveAttribute(
		'href',
		shareAccessPath
	);
} );

test( 'opens the same page after the customer starts an assisted handoff', async () => {
	const diySite = { ...site, site_migration: { ...site.site_migration, type: 'wordpress' } };
	nock( api ).get( siteEndpoint ).query( true ).reply( 200, diySite );
	mockPost( '/wpcom/v2/sites/123/wordpress-migration/assisted-handoff' ).reply( 200, {
		source_url: source,
	} );
	mockPendingSite();

	const { router } = render( <AssistedIntro siteSlug={ siteSlug } /> );
	await userEvent.click( await screen.findByRole( 'button', { name: 'Have our team do it' } ) );

	await waitFor( () => expect( router.state.location.pathname ).toBe( shareAccessPath ) );
} );

test( 'prefills the source address and lets the user share a backup link', async () => {
	mockPendingSite();
	const request = mockPost( '/wpcom/v2/sites/123/automated-migration', {
		migration_type: 'backup',
		from_url: 'https://example.com/backup.zip',
		notes: '',
		blog_url: siteSlug,
	} ).reply( 200, { success: true } );

	const { router } = renderShareAccess();

	expect( screen.getByRole( 'textbox', { name: 'Current WordPress site address' } ) ).toHaveValue(
		source
	);
	await userEvent.click( screen.getByRole( 'radio', { name: 'Backup file' } ) );
	await userEvent.type(
		screen.getByRole( 'textbox', { name: 'Backup file location' } ),
		'https://example.com/backup.zip'
	);
	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

	await expectOverview( router );
	expect( request.isDone() ).toBe( true );
} );

test( 'lets the user choose manual credentials and retry a failed verification', async () => {
	mockPendingSite( 2 );
	const setup = mockAuthorization();
	const request = mockPost( '/wpcom/v2/sites/123/automated-migration', {
		migration_type: 'credentials',
		from_url: source,
		username: 'admin',
		password: 'test-password',
		notes: '',
		bypass_verification: false,
		blog_url: siteSlug,
	} ).reply( 400, { code: 'automated_migration_tools_login_and_get_cookies_test_failed' } );

	renderShareAccess();

	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	expect( await screen.findByRole( 'button', { name: 'Authorize access' } ) ).toBeVisible();
	await userEvent.click( screen.getByRole( 'button', { name: 'Share credentials instead' } ) );
	await userEvent.type( screen.getByLabelText( 'WordPress admin username' ), 'admin' );
	await userEvent.type( screen.getByLabelText( 'Password' ), 'test-password' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

	expect( await screen.findByRole( 'button', { name: 'Continue anyway' } ) ).toBeVisible();
	expect( setup.isDone() ).toBe( true );
	expect( request.isDone() ).toBe( true );
} );

test.each( [ 'abcd1234abcd1234abcd1234', 'abcd 1234 abcd 1234 abcd 1234' ] )(
	'submits a matching authorization return after clearing credentials from the URL (%s)',
	async ( password ) => {
		if ( ! window.crypto.randomUUID ) {
			Object.defineProperty( window.crypto, 'randomUUID', { value: randomUUID } );
		}
		window.history.replaceState( null, '', shareAccessPath );
		const url = getMigrationAuthorizationUrl(
			site.ID,
			source,
			`${ source }wp-admin/authorize-application.php`
		);
		const callback = new URL( url!.searchParams.get( 'success_url' )! );
		window.history.replaceState(
			null,
			'',
			shareAccessPath +
				callback.hash +
				'&user_login=admin&password=' +
				encodeURIComponent( password )
		);
		captureMigrationAuthorization();
		mockPendingSite();

		const request = mockPost( '/wpcom/v2/sites/123/automated-migration/application-passwords', {
			from_url: source,
			username: 'admin',
			password: 'abcd 1234 abcd 1234 abcd 1234',
		} ).reply( 200, { success: true } );

		const { router } = renderShareAccess();

		expect( window.location.hash ).toBe( '' );
		await expectOverview( router );
		expect( request.isDone() ).toBe( true );
	}
);

test( 'drops an unsolicited authorization return and keeps the details form', () => {
	window.history.replaceState(
		null,
		'',
		shareAccessPath + '#migration-authorization=unknown&user_login=admin&password=test-password'
	);
	captureMigrationAuthorization();

	renderShareAccess();

	expect(
		screen.getByRole( 'heading', { name: 'Tell us about your WordPress site' } )
	).toBeVisible();
	expect( window.location.hash ).toBe( '' );
} );

test( 'returns to the overview if the assisted handoff was cancelled in another tab', async () => {
	const currentSite = nock( api )
		.get( siteEndpoint )
		.query( true )
		.reply( 200, { ...site, site_migration: { type: 'wordpress', status_v2: 'pending' } } );
	const help = mockPost( '/wpcom/v2/help/migration-ticket/new' ).reply( 200 );
	const { router } = renderShareAccess();

	await userEvent.click( screen.getByRole( 'button', { name: 'Have our team email you' } ) );

	await expectOverview( router );
	expect( currentSite.isDone() ).toBe( true );
	expect( help.isDone() ).toBe( false );
} );

test.each( [
	[
		{ platform: 'wordpress', platform_data: { is_wpcom: true } },
		undefined,
		'This site is already on WordPress.com.',
	],
	[ { platform: 'wix' }, 'site_is_not_wordpress', 'Our migration service is for WordPress sites.' ],
] )(
	'keeps detected-source ticket handling separate from an explicit help request',
	async ( sourceInfo, context, message ) => {
		mockPendingSite();
		const ticket = nock( api )
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: source } )
			.reply( 200, sourceInfo )
			.post( '/wpcom/v2/help/migration-ticket/new', {
				locale: 'en',
				blog_url: siteSlug,
				from_url: source,
				...( context ? { context } : {} ),
			} )
			.query( true )
			.reply( 200, { success: true } );

		renderShareAccess();
		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByText( message, { exact: false } ) ).toBeVisible();
		expect( ticket.isDone() ).toBe( true );
	}
);

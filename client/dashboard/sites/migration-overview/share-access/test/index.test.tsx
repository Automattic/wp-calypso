/**
 * @vitest-environment jsdom
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

function mockSource() {
	return nock( api )
		.get( '/wpcom/v2/imports/analyze-url' )
		.query( { site_url: source } )
		.reply( 200, { platform: 'wordpress' } );
}

function mockPendingSite( times = 1 ) {
	return nock( api ).get( siteEndpoint ).query( true ).times( times ).reply( 200, site );
}

const mockPost = ( path: string, body?: nock.RequestBodyMatcher ) =>
	nock( api ).post( path, body ).query( true );
const mockAuthorizationSetup = () =>
	mockPost( '/wpcom/v2/sites/123/automated-migration/application-passwords/setup', { source } );
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

test( 'offers authorization and manual credentials for the saved source without submitting anything on arrival', () => {
	const analysis = mockSource();
	const setup = mockAuthorizationSetup().reply( 200 );
	const help = mockPost( '/wpcom/v2/help/migration-ticket/new' ).reply( 200 );

	renderShareAccess();

	expect(
		screen.getByText( 'Authorize WordPress.com in the WordPress admin for source.example.com.' )
	).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Authorize access' } ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Share credentials instead' } ) ).toBeVisible();
	expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'radio' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
	expect( analysis.isDone() ).toBe( false );
	expect( setup.isDone() ).toBe( false );
	expect( help.isDone() ).toBe( false );
} );

test( 'falls back to manual credentials when the user asks to authorize and the source does not support it', async () => {
	mockPendingSite();
	const analysis = mockSource();
	const setup = mockAuthorizationSetup().reply( 500, { code: 'failed_to_get_authorization_path' } );

	renderShareAccess();
	await userEvent.click( screen.getByRole( 'button', { name: 'Authorize access' } ) );

	expect(
		await screen.findByRole( 'heading', { name: 'Securely share your credentials' } )
	).toBeVisible();
	expect( analysis.isDone() ).toBe( true );
	expect( setup.isDone() ).toBe( true );
} );

test.each( [ '', 'https://user:password@source.example.com' ] )(
	'blocks access for a missing or invalid saved source (%s)',
	async ( sourceUrl ) => {
		const { router } = render( <ShareAccessForm site={ site } sourceUrl={ sourceUrl } /> );

		expect( screen.getByText( /We couldn’t find a valid source site/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Authorize access' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Share credentials instead' } ) ).toBeDisabled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		await expectOverview( router );
	}
);

test( 'lets the user choose manual credentials and retry a failed verification', async () => {
	mockPendingSite( 2 );
	const analysis = mockSource();
	const setup = mockAuthorizationSetup().reply( 200 );
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

	await userEvent.click( screen.getByRole( 'button', { name: 'Share credentials instead' } ) );
	await userEvent.type( await screen.findByLabelText( 'WordPress admin username' ), 'admin' );
	await userEvent.type( screen.getByLabelText( 'Password' ), 'test-password' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

	expect( await screen.findByRole( 'button', { name: 'Continue anyway' } ) ).toBeVisible();
	expect( analysis.isDone() ).toBe( true );
	expect( setup.isDone() ).toBe( false );
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

test( 'drops an unsolicited authorization return and keeps the access choice', () => {
	window.history.replaceState(
		null,
		'',
		shareAccessPath + '#migration-authorization=unknown&user_login=admin&password=test-password'
	);
	captureMigrationAuthorization();

	renderShareAccess();

	expect( screen.getByRole( 'button', { name: 'Authorize access' } ) ).toBeVisible();
	expect( window.location.hash ).toBe( '' );
} );

test( 'requests help for the saved source and returns to the overview', async () => {
	mockPendingSite();
	const help = mockPost( '/wpcom/v2/help/migration-ticket/new', {
		locale: 'en',
		blog_url: siteSlug,
		from_url: source,
		context: 'help_requested',
	} ).reply( 200, { success: true } );
	const { router } = renderShareAccess();

	await userEvent.click( screen.getByRole( 'button', { name: 'Have our team email you' } ) );

	await expectOverview( router );
	expect( help.isDone() ).toBe( true );
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
		'Authorize access',
	],
	[
		{ platform: 'wix' },
		'site_is_not_wordpress',
		'Our migration service is for WordPress sites.',
		'Share credentials instead',
	],
] )(
	'keeps detected-source ticket handling separate from an explicit help request',
	async ( sourceInfo, context, message, button ) => {
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
		await userEvent.click( screen.getByRole( 'button', { name: button } ) );

		expect( await screen.findByText( message, { exact: false } ) ).toBeVisible();
		expect( ticket.isDone() ).toBe( true );
	}
);

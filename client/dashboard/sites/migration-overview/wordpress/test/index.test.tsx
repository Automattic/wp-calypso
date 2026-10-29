/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { focusManager } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { WordPressMigration } from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 42,
	slug: 'example.wordpress.com',
	name: 'Example',
	URL: 'https://example.wordpress.com',
	site_migration: { type: 'wordpress', status_v2: 'started' },
} as unknown as Site;

const migration = ( status: string, extra = {} ) => ( {
	status,
	phase: null,
	findings: [],
	source_url: 'https://www.example.com',
	started_at: null,
	completed_at: null,
	notification_emails: [],
	...extra,
} );

const finding = ( code: string, severity: string ) => ( {
	code,
	severity,
	label: `${ code } label`,
	message: `${ code } message`,
} );

const running = migration( 'running', {
	phase: 'migration',
	notification_emails: [ 'owner@example.com' ],
} );

const configuration = {
	source_url: 'https://www.example.com',
	source_connection: null,
	available_source_connections: [
		{
			method: 'manual-wpcom-install',
			key: 'public-key',
			plugin_url: 'https://wordpress.org/plugins/wpcom-migration/',
			install_url: 'https://www.example.com/wp-admin/plugin-install.php',
			connect_url: 'https://www.example.com/wp-admin/admin.php?page=wpcom-migration-status',
			manual_url: 'https://www.example.com/wp-admin/admin.php?page=wpcom-migration-manual',
		},
	],
};

const refused = ( extra = {} ) =>
	migration( 'failed', {
		phase: 'preflight',
		findings: [ { ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' } ],
		...extra,
	} );

const connectedConfiguration = () => ( {
	...configuration,
	available_source_connections: [
		{ ...configuration.available_source_connections[ 0 ], connected: true },
	],
} );

const mockApi = () => nock( 'https://public-api.wordpress.com' );
const statusPath = '/wpcom/v2/sites/42/wordpress-migration/status';
const configurePath = '/wpcom/v2/sites/42/wordpress-migration/configure';
const runPath = '/wpcom/v2/sites/42/wordpress-migration/run';

describe( 'WordPressMigration', () => {
	// The site only reads as locked by its own state while the flow is switched on.
	beforeEach( () => config.enable( 'migration/reprint-flow' ) );
	afterEach( () => {
		config.disable( 'migration/reprint-flow' );
		queryClient.clear();
		// After clearing: going back to the default focus state refetches every query it finds, and a refetch still in
		// flight would take the next test's mocked replies.
		focusManager.setFocused( undefined );
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'walks through connecting the source, then follows the migration once it starts', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		const [ manualInstall ] = configuration.available_source_connections;
		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'link', { name: /Install the plugin/ } ) ).toHaveAttribute(
				'href',
				manualInstall.install_url
			)
		);
		expect( screen.queryByText( 'Plugin installed and connected' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: /Have our team handle this migration/ } )
		).toBeDisabled();

		// The install button comes first: the other ways in are only there for people who have trouble with it.
		expect( screen.queryByRole( 'link', { name: /WordPress.org/ } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: /Having trouble/ } ) );
		expect( screen.getByRole( 'link', { name: /WordPress.org/ } ) ).toHaveAttribute(
			'href',
			manualInstall.plugin_url
		);
		expect( screen.getByRole( 'link', { name: /settings page/ } ) ).toHaveAttribute(
			'href',
			manualInstall.connect_url
		);
		expect( screen.getByRole( 'textbox', { name: 'Migration key' } ) ).toHaveValue( 'public-key' );
		expect( screen.getByRole( 'link', { name: /migration key page/ } ) ).toHaveAttribute(
			'href',
			manualInstall.manual_url
		);

		const configure = mockApi()
			.post( configurePath, { source_connection: { method: 'manual-wpcom-install' } } )
			.reply( 200, configuration );
		const run = mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect(
			screen.getAllByRole( 'progressbar' ).map( ( bar ) => bar.getAttribute( 'aria-label' ) )
		).toEqual( [ 'Verifying', 'Copying', 'Finishing' ] );
		expect( screen.getByRole( 'strong' ) ).toHaveTextContent( 'owner@example.com' );
		expect( configure.isDone() ).toBe( true );
		expect( run.isDone() ).toBe( true );
	} );

	it( 'tells people who connected the plugin to start the migration', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi()
			.get( configurePath )
			.query( true )
			.reply( 200, {
				...configuration,
				available_source_connections: [
					{ ...configuration.available_source_connections[ 0 ], connected: true },
				],
			} );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Ready to migrate example.com' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /Install the plugin/ } ) ).not.toBeInTheDocument();
		// Connected doesn't mean installed, so the steps stay, with the install link in the first.
		expect( screen.getByRole( 'link', { name: /^Install\b(?! the plugin)/ } ) ).toHaveAttribute(
			'href',
			configuration.available_source_connections[ 0 ].install_url
		);

		// Still there for anyone whose migration doesn't start.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: /Having trouble/ } ) );
		expect( screen.getByRole( 'textbox', { name: 'Migration key' } ) ).toHaveValue( 'public-key' );
	} );

	it( 'trusts the migration’s word on the connection over the site’s details', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply( 200, migration( 'not_started', { source_connected: true } ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		expect( screen.queryByRole( 'link', { name: /Install the plugin/ } ) ).not.toBeInTheDocument();
	} );

	it( 'notices the plugin being connected in another tab', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply( 200, migration( 'not_started', { source_connected: false } ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();

		mockApi()
			.get( statusPath )
			.query( true )
			.reply( 200, migration( 'not_started', { source_connected: true } ) );
		act( () => focusManager.setFocused( true ) );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
	} );

	it( 'offers to try again once the source is connected after refusing', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				refused( {
					source_connected: true,
					findings: [
						{ ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' },
						finding( 'source_woocommerce_active', 'warning' ),
					],
				} )
			);
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /Install the plugin/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'source_connection_failed label' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeVisible();

		const run = mockApi()
			.post( runPath, {
				accept_findings: [ 'source_connection_failed', 'source_woocommerce_active' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( run.isDone() ).toBe( true );
	} );

	it( 'shows the refusal when a retry is refused again', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply( 200, refused( { source_connected: true } ) );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);

		mockApi()
			.post( runPath )
			.reply( 202, refused( { source_connected: true } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin installed and connected' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps showing a refusal until the migration says the source is connected', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, refused() );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		expect( screen.queryByText( /Plugin (installed and )?connected/ ) ).not.toBeInTheDocument();
	} );

	it( 'keeps showing a refusal that came with another failure', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				refused( {
					source_connected: true,
					findings: [
						{ ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' },
						{ ...finding( 'source_redirect_invalid', 'failure' ), resolution: 'retry' },
					],
				} )
			);
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.queryByText( /Plugin (installed and )?connected/ ) ).not.toBeInTheDocument();

		// The source is connected, so starting over doesn't need checking first.
		const configure = mockApi().post( configurePath ).reply( 200, configuration );
		mockApi().post( runPath ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( configure.isDone() ).toBe( true );
	} );

	it( 'continues a paused migration by accepting its warnings', async () => {
		const paused = migration( 'paused', {
			phase: 'preflight',
			findings: [
				finding( 'destination_site_not_new', 'warning' ),
				finding( 'source_woocommerce_active', 'warning' ),
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, paused );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'destination_site_not_new label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();
		// Warnings mean the migration read the source, so there's no need to set it up again.
		expect(
			screen.queryByText( /and activate the Migrate to WordPress.com plugin/ )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Having trouble/ } ) ).not.toBeInTheDocument();

		mockApi()
			.post( runPath, {
				accept_findings: [ 'destination_site_not_new', 'source_woocommerce_active' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
	} );

	it( 'lets a stopped migration get to the migration key', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				migration( 'failed', {
					phase: 'migration',
					findings: [ { ...finding( 'migration_failed', 'failure' ), resolution: 'retry' } ],
				} )
			);
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Your migration stopped' } )
		).toBeVisible();
		expect( screen.getByText( 'migration_failed label' ) ).toBeVisible();
		// The finding says what went wrong, so the card doesn't say it again.
		expect( screen.queryByText( /couldn’t finish/ ) ).not.toBeInTheDocument();
		// It may have stopped because the plugin was deactivated, so the setup steps are there to go back to.
		expect( screen.getByText( /and activate the Migrate to WordPress.com plugin/ ) ).toBeVisible();
		expect( screen.getByText( '3. Come back here and try again.' ) ).toBeVisible();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: /Having trouble/ } ) );
		expect( screen.getByRole( 'textbox', { name: 'Migration key' } ) ).toHaveValue( 'public-key' );
	} );

	it( 'offers to try again when a finding says continuing is only a retry', async () => {
		const failed = migration( 'failed', {
			phase: 'preflight',
			findings: [
				finding( 'source_woocommerce_active', 'warning' ),
				{ ...finding( 'source_redirect_invalid', 'failure' ), resolution: 'retry' },
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_redirect_invalid label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();

		const run = mockApi()
			.post( runPath, {
				accept_findings: [ 'source_woocommerce_active', 'source_redirect_invalid' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( run.isDone() ).toBe( true ) );
	} );

	it( 'sends a refused connection straight back to the connect step', async () => {
		const failed = migration( 'failed', {
			phase: 'preflight',
			findings: [ { ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' } ],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
		expect( screen.getByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();

		const configure = mockApi()
			.post( configurePath, { source_connection: { method: 'manual-wpcom-install' } } )
			.reply( 200, configuration );
		const run = mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		// The source isn't connected and the key was never looked at, so it checks first.
		expect( screen.getByRole( 'dialog', { name: 'Start the migration anyway?' } ) ).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Start anyway' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( configure.isDone() ).toBe( true );
		expect( run.isDone() ).toBe( true );
	} );

	it( 'checks before starting a migration that can’t reach its source', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Start the migration' } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Go back' } ) );

		// Nothing was started: going back leaves the connect step as it was.
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
	} );

	it( 'leaves out the email promise when no one will be notified', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply( 200, { ...running, notification_emails: [] } )
			.persist();

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'You can leave this page. The migration will continue running in the background.'
			)
		).toBeVisible();
		expect( screen.queryByText( /We will email you/ ) ).not.toBeInTheDocument();
	} );

	it( 'catches up with the migration when a run is refused', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'paused' ) );

		render( <WordPressMigration site={ site } />, { queryClient } );

		mockApi()
			.post( runPath )
			.reply( 409, { code: 'site_migration_already_in_progress', message: 'Refused' } );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
	} );

	it( 'says so when the migration can’t be loaded, and loads it on another try', async () => {
		mockApi().get( statusPath ).query( true ).reply( 404, { code: 'rest_no_route' } );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( /We couldn’t load your migration/ ) ).toBeVisible();

		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( screen.queryByText( /We couldn’t load your migration/ ) ).not.toBeInTheDocument();
	} );

	it( 'waits on a completed migration whose site is still locked, then offers a way out', async () => {
		jest.useFakeTimers( { advanceTimers: true } );
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'completed' ) );

		const { router } = render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Your site has been migrated' } )
		).toBeVisible();
		expect( screen.getByText( /One moment while we finish up/ ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Reload' } ) ).not.toBeInTheDocument();
		expect( router.state.location.pathname ).toBe( '/' );

		act( () => jest.advanceTimersByTime( 30000 ) );

		expect( await screen.findByRole( 'button', { name: 'Reload' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
		expect( router.state.location.pathname ).toBe( '/' );
		jest.useRealTimers();
	} );

	it( 'hands over to the site once a completed migration has unlocked it', async () => {
		const unlockedSite = {
			...site,
			site_migration: { type: 'wordpress', status_v2: 'completed' },
		} as unknown as Site;
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'completed' ) );

		const { router } = render( <WordPressMigration site={ unlockedSite } />, { queryClient } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/sites/example.wordpress.com' )
		);
	} );

	it( 'still says a migration is underway for a status it doesn’t know', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'assisted' ) );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Your site is being migrated' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
	} );

	it( 'tells people who can’t manage the migration that one is underway', async () => {
		mockApi().get( statusPath ).query( true ).reply( 403, { code: 'rest_forbidden' } );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'A migration to this site is underway' } )
		).toBeVisible();
		expect( screen.queryByText( /We couldn’t load your migration/ ) ).not.toBeInTheDocument();
	} );
} );

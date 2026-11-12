/**
 * @jest-environment jsdom
 */
import {
	queryClient,
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationStatusQuery,
} from '@automattic/api-queries';
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
	progress: null,
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

const unreachable = ( extra = {} ) =>
	migration( 'failed', {
		phase: 'preflight',
		findings: [
			{ ...finding( 'source_plugin_unreachable', 'failure' ), resolution: 'assisted_handoff' },
		],
		...extra,
	} );

const lastAttempt = ( code: string ) => `The last attempt ran into a problem: ${ code } label`;

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
		jest.useRealTimers();
		config.disable( 'migration/reprint-flow' );
		queryClient.clear();
		// After clearing: going back to the default focus state refetches every query it finds, and a refetch still in
		// flight would take the next test's mocked replies.
		focusManager.setFocused( undefined );
		window.history.replaceState( {}, '', '/' );
		window._sva = undefined;
		window.localStorage.clear();
	} );

	test( 'asks for the migration survey once per migration, even when the run is resumed', async () => {
		const invokeEvent = jest.fn();
		Object.assign( window, { _sva: { invokeEvent } } );
		const started = { ...running, started_at: '2026-11-05T10:00:00+00:00' };
		mockApi().get( statusPath ).query( true ).reply( 200, started );

		const { unmount } = render( <WordPressMigration site={ site } />, { queryClient } );
		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
		expect( invokeEvent ).toHaveBeenCalledWith( 'migrationStarted' );
		unmount();

		// Coming back to the same migration, resumed after a pause, doesn't ask again.
		queryClient.clear();
		const resumed = { ...running, started_at: '2026-11-05T11:00:00+00:00' };
		mockApi().get( statusPath ).query( true ).reply( 200, resumed );
		render( <WordPressMigration site={ site } />, { queryClient } );
		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'walks through connecting the source, then follows the migration once it starts', async () => {
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
			screen.getByRole( 'link', { name: /Have our team handle this migration/ } )
		).toHaveAttribute( 'href', `/sites/${ site.slug }/migration-overview/assisted` );

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

		await userEvent.click(
			screen.getByRole( 'button', { name: 'The plugin is connected, start the migration' } )
		);

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect(
			screen.getAllByRole( 'progressbar' ).map( ( bar ) => bar.getAttribute( 'aria-label' ) )
		).toEqual( [ 'Verifying', 'Copying', 'Finishing' ] );
		expect( screen.getByRole( 'strong' ) ).toHaveTextContent( 'owner@example.com' );
		expect( configure.isDone() ).toBe( true );
		expect( run.isDone() ).toBe( true );
	} );

	test( 'tells people who connected the plugin to start the migration', async () => {
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
		expect( screen.queryByText( /install and activate/ ) ).not.toBeVisible();
		expect(
			screen.getByRole( 'button', { name: /Having trouble/, hidden: true } )
		).not.toBeVisible();
	} );

	test( 'notices the plugin being connected in another tab', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();

		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );
		act( () => focusManager.setFocused( true ) );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
	} );

	test( 'warns when the plugin is installed on the WordPress.com site, until the source is connected', async () => {
		const onDestination = ( connected: boolean ) => ( {
			...configuration,
			available_source_connections: [
				{
					...configuration.available_source_connections[ 0 ],
					connected,
					installed_on_destination: true,
				},
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, onDestination( false ) );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'The plugin is installed on the wrong site' ) ).toBeVisible();
		expect( screen.getByText( /installed on your WordPress.com site/ ) ).toHaveTextContent(
			'Install it on example.com, the site you’re migrating from.'
		);

		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, onDestination( true ) );
		act( () => focusManager.setFocused( true ) );

		expect( await screen.findByText( 'Plugin installed and connected' ) ).toBeVisible();
		expect(
			screen.queryByText( 'The plugin is installed on the wrong site' )
		).not.toBeInTheDocument();
	} );

	test( 'keeps an unreachable plugin up on its own until the next run, but offers to start once connected', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, unreachable() );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( lastAttempt( 'source_plugin_unreachable' ) ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin installed and connected' ) ).not.toBeInTheDocument();

		// Connected in another tab, then back to this one. The source may still refuse a run, so the refusal stays,
		// without a success notice beside it, and the steps give way to how the source reads now.
		mockApi().get( statusPath ).query( true ).reply( 200, unreachable() );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );
		act( () => focusManager.setFocused( true ) );

		await waitFor( () =>
			expect( screen.queryByRole( 'link', { name: /Install the plugin/ } ) ).not.toBeInTheDocument()
		);
		expect( screen.getByText( lastAttempt( 'source_plugin_unreachable' ) ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin installed and connected' ) ).not.toBeInTheDocument();
		expect( screen.getByText( /appears to have the plugin installed/ ) ).toBeVisible();
		expect( screen.queryByText( /install and activate/ ) ).not.toBeVisible();
		expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeVisible();

		const configure = mockApi()
			.post( configurePath, { source_connection: { method: 'manual-wpcom-install' } } )
			.reply( 200, connectedConfiguration() );
		const run = mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Start the migration' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( configure.isDone() ).toBe( true );
		expect( run.isDone() ).toBe( true );
	} );

	test( 'starts over from an unreachable plugin without checking once the source is connected', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				unreachable( {
					findings: [
						{
							...finding( 'source_plugin_unreachable', 'failure' ),
							resolution: 'assisted_handoff',
						},
						{ ...finding( 'source_redirect_invalid', 'failure' ), resolution: 'retry' },
					],
				} )
			);
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( lastAttempt( 'source_plugin_unreachable' ) ) ).toBeVisible();

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

	test( 'continues a paused migration by accepting its warnings', async () => {
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
		expect( screen.queryByRole( 'button', { name: 'Back to setup' } ) ).not.toBeInTheDocument();

		mockApi()
			.post( runPath, {
				accept_findings: [ 'destination_site_not_new', 'source_woocommerce_active' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
	} );

	test( 'sends a migration stopped for a missing plan to choose one, then try again', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				migration( 'failed', {
					phase: 'prepare-destination',
					findings: [ { ...finding( 'destination_needs_plan', 'failure' ), resolution: 'retry' } ],
				} )
			);

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'destination_needs_plan label' ) ).toBeVisible();

		const choosePlan = new URL(
			screen.getByRole( 'link', { name: 'Choose a plan' } ).getAttribute( 'href' ) ?? ''
		);
		expect( choosePlan.pathname ).toBe( '/setup/plan-upgrade/' );
		expect( choosePlan.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( choosePlan.searchParams.get( 'redirect_to' ) ).toBeTruthy();

		// Coming back with a plan, the stored finding is still there, so trying again has to stay on offer.
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeEnabled();
	} );

	test( 'takes a stopped migration back to setup, and leaves once it starts again', async () => {
		const stopped = migration( 'failed', {
			phase: 'preflight',
			findings: [ { ...finding( 'migration_failed', 'failure' ), resolution: 'retry' } ],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, stopped );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Your migration stopped' } )
		).toBeVisible();
		expect( screen.getByText( 'migration_failed label' ) ).toBeVisible();
		await waitFor( () =>
			expect(
				queryClient.getQueryData( siteWordPressMigrationConfigurationQuery( site.ID ).queryKey )
			).toBeDefined()
		);

		// The source was disconnected while the run was going, so going back reads it again.
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );
		// The finding says what went wrong, so the card doesn't say it again.
		expect( screen.queryByText( /couldn’t finish/ ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Back to setup' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
		expect( screen.getByText( lastAttempt( 'migration_failed' ) ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeEnabled()
		);
		await userEvent.click( screen.getByRole( 'button', { name: /Having trouble/ } ) );
		expect( screen.getByRole( 'textbox', { name: 'Migration key' } ) ).toHaveValue( 'public-key' );

		mockApi().post( configurePath ).reply( 200, configuration );
		mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click(
			screen.getByRole( 'button', { name: 'The plugin is connected, start the migration' } )
		);

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();

		// When that run stops too, it shows what stopped it instead of going back to setup.
		act( () => {
			queryClient.setQueryData( siteWordPressMigrationStatusQuery( site.ID ).queryKey, stopped );
		} );

		expect(
			await screen.findByRole( 'heading', { name: 'Your migration stopped' } )
		).toBeVisible();
	} );

	test( 'keeps what stopped the run on screen when going back to a connected source', async () => {
		mockApi()
			.get( statusPath )
			.query( true )
			.reply(
				200,
				migration( 'failed', {
					phase: 'migration',
					findings: [ { ...finding( 'generic_failure', 'failure' ), resolution: 'retry' } ],
				} )
			);
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() ).persist();

		render( <WordPressMigration site={ site } />, { queryClient } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Back to setup' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Ready to migrate example.com' } )
		).toBeVisible();
		expect( screen.getByText( lastAttempt( 'generic_failure' ) ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin installed and connected' ) ).not.toBeInTheDocument();
		expect( screen.getByText( /appears to have the plugin installed/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Having trouble/ } ) ).toBeVisible();
	} );

	// A finding our team takes over too: a customer who took their migration back can still try again.
	test.each( [ 'retry', 'assisted_handoff' ] as const )(
		'offers to try again when a finding resolves by %s',
		async ( resolution ) => {
			const failed = migration( 'failed', {
				phase: 'preflight',
				findings: [
					finding( 'source_woocommerce_active', 'warning' ),
					{ ...finding( 'source_redirect_invalid', 'failure' ), resolution },
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
		}
	);

	test( 'sends a refused connection to adding the key by hand, then runs again without configuring', async () => {
		const failed = migration( 'failed', {
			phase: 'preflight',
			findings: [ { ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' } ],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );
		mockApi().get( configurePath ).query( true ).reply( 200, connectedConfiguration() );

		render( <WordPressMigration site={ site } />, { queryClient } );

		// Even when the source reads as connected: that can be another account's connection.
		expect( await screen.findByRole( 'heading', { name: 'Add the migration key' } ) ).toBeVisible();
		expect( screen.getByText( lastAttempt( 'source_connection_failed' ) ) ).toBeVisible();
		expect( screen.getByRole( 'textbox', { name: 'Migration key' } ) ).toHaveValue( 'public-key' );
		expect( screen.getByRole( 'link', { name: /Open the migration key page/ } ) ).toHaveAttribute(
			'href',
			configuration.available_source_connections[ 0 ].manual_url
		);
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();
		// Our team can take it from here instead.
		expect(
			screen.getByRole( 'link', { name: /Have our team handle this migration/ } )
		).toHaveAttribute( 'href', '/sites/example.wordpress.com/migration-overview/assisted' );

		// Configuring again would forget what was accepted, like an unverified certificate, so it only runs.
		const configure = mockApi().post( configurePath ).reply( 200, configuration );
		const run = mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click(
			screen.getByRole( 'button', { name: 'The key is added, start the migration' } )
		);

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( run.isDone() ).toBe( true );
		expect( configure.isDone() ).toBe( false );
	} );

	test( 'checks before starting a migration that can’t reach its source', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		await waitFor( () =>
			expect(
				screen.getByRole( 'button', { name: 'The plugin is connected, start the migration' } )
			).toBeEnabled()
		);
		await userEvent.click(
			screen.getByRole( 'button', { name: 'The plugin is connected, start the migration' } )
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Go back' } ) );

		// Nothing was started: going back leaves the connect step as it was.
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
	} );

	test( 'leaves out the email promise when no one will be notified', async () => {
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

	test( 'catches up with the migration when a run is refused', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'paused' ) );

		render( <WordPressMigration site={ site } />, { queryClient } );

		mockApi()
			.post( runPath )
			.reply( 409, { code: 'site_migration_already_in_progress', message: 'Refused' } );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
	} );

	test( 'says so when the migration can’t be loaded, and loads it on another try', async () => {
		mockApi().get( statusPath ).query( true ).reply( 404, { code: 'rest_no_route' } );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( /We couldn’t load your migration/ ) ).toBeVisible();

		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( screen.queryByText( /We couldn’t load your migration/ ) ).not.toBeInTheDocument();
	} );

	test( 'waits on a completed migration whose site is still locked, then offers a way out', async () => {
		// Only the clock: faking the queues a request goes through holds the mocked replies back.
		jest.useFakeTimers( {
			advanceTimers: true,
			doNotFake: [ 'nextTick', 'setImmediate', 'queueMicrotask' ],
		} );
		// Waiting on the site reloads the migration too.
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'completed' ) ).persist();

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
	} );

	test( 'hands over to the site once a completed migration has unlocked it', async () => {
		const unlockedSite = {
			...site,
			site_migration: { type: 'wordpress', status_v2: 'completed' },
		} as unknown as Site;
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'completed' ) );

		const { router } = render( <WordPressMigration site={ unlockedSite } />, { queryClient } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/sites/example.wordpress.com' )
		);
		expect( router.state.location.search ).toEqual( { migration: 'completed' } );
	} );

	test( 'still says a migration is underway for a status it doesn’t know', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'assisted' ) );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'Your site is being migrated' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
	} );

	test( 'tells people who can’t manage the migration that one is underway', async () => {
		mockApi().get( statusPath ).query( true ).reply( 403, { code: 'rest_forbidden' } );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'A migration to this site is underway' } )
		).toBeVisible();
		expect( screen.queryByText( /We couldn’t load your migration/ ) ).not.toBeInTheDocument();
	} );
} );

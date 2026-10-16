/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { WordPressMigration } from '../index';
import type { Site, WordPressMigrationFinding } from '@automattic/api-core';

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
	...extra,
} );

const finding = (
	code: string,
	severity: WordPressMigrationFinding[ 'severity' ],
	resolution: WordPressMigrationFinding[ 'resolution' ]
): WordPressMigrationFinding => ( {
	code,
	severity,
	resolution,
	label: `${ code } label`,
	message: `${ code } message`,
} );

const running = migration( 'running', { phase: 'migration' } );

const configuration = {
	source_url: 'https://www.example.com',
	source_connection: null,
	available_source_connections: [
		{
			method: 'manual-wpcom-install',
			key: 'public-key',
			install_url: 'https://www.example.com/wp-admin/plugin-install.php',
		},
	],
};

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
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'shows the key to install, then follows the migration once it starts', async () => {
		mockApi().get( statusPath ).query( true ).reply( 200, migration( 'not_started' ) );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'waiting for access to example.com' ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'textbox', { name: 'Secret key' } ) ).toHaveValue( 'public-key' )
		);
		expect( screen.getByRole( 'link', { name: /Install the plugin/ } ) ).toHaveAttribute(
			'href',
			configuration.available_source_connections[ 0 ].install_url
		);

		const configure = mockApi()
			.post( configurePath, { source_connection: { method: 'manual-wpcom-install' } } )
			.reply( 200, configuration );
		const run = mockApi().post( runPath, {} ).reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: /start the migration/ } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
		expect( screen.getByText( 'migrating from example.com' ) ).toBeVisible();
		expect( configure.isDone() ).toBe( true );
		expect( run.isDone() ).toBe( true );
	} );

	it( 'continues a paused migration by accepting its warnings', async () => {
		const paused = migration( 'paused', {
			phase: 'preflight',
			findings: [
				finding( 'source_is_multisite', 'warning', 'accept' ),
				finding( 'source_woocommerce_active', 'warning', 'accept' ),
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, paused );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_is_multisite label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();
		expect( screen.getByText( 'source_is_multisite message' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active message' ) ).toBeVisible();

		mockApi()
			.post( runPath, {
				accept_findings: [ 'source_is_multisite', 'source_woocommerce_active' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Migrating example.com' } ) ).toBeVisible();
	} );

	it( 'offers to try again when a finding says continuing is only a retry', async () => {
		const failed = migration( 'failed', {
			phase: 'preflight',
			findings: [
				finding( 'source_woocommerce_active', 'warning', 'accept' ),
				finding( 'source_tls_unverified', 'failure', 'accept' ),
				finding( 'source_connection_failed', 'failure', 'retry' ),
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();
		expect( screen.getByText( 'source_tls_unverified label' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Reconnect your site' } )
		).not.toBeInTheDocument();

		const run = mockApi()
			.post( runPath, {
				accept_findings: [
					'source_woocommerce_active',
					'source_tls_unverified',
					'source_connection_failed',
				],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( run.isDone() ).toBe( true ) );
	} );

	it.each( [ 'source_tls_unverified', 'source_redirect' ] )(
		'continues a failed migration when %s can be accepted',
		async ( code ) => {
			mockApi()
				.get( statusPath )
				.query( true )
				.reply(
					200,
					migration( 'failed', {
						phase: 'preflight',
						findings: [ finding( code, 'failure', 'accept' ) ],
					} )
				);

			render( <WordPressMigration site={ site } />, { queryClient } );

			expect( await screen.findByText( `${ code } label` ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();

			const run = mockApi()
				.post( runPath, { accept_findings: [ code ] } )
				.reply( 202, running );
			mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect(
				await screen.findByRole( 'heading', { name: 'Migrating example.com' } )
			).toBeVisible();
			expect( run.isDone() ).toBe( true );
		}
	);

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

		expect( await screen.findByText( 'migrated from example.com' ) ).toBeVisible();
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

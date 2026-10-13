/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
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
	...extra,
} );

const finding = ( code: string, severity: string ) => ( {
	code,
	severity,
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
	afterEach( () => queryClient.clear() );

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
				finding( 'destination_site_not_new', 'warning' ),
				finding( 'source_woocommerce_active', 'warning' ),
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, paused );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'destination_site_not_new label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();

		mockApi()
			.post( runPath, {
				accept_findings: [ 'destination_site_not_new', 'source_woocommerce_active' ],
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
				finding( 'source_woocommerce_active', 'warning' ),
				{ ...finding( 'source_connection_failed', 'failure' ), resolution: 'retry' },
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.getByText( 'source_woocommerce_active label' ) ).toBeVisible();

		const run = mockApi()
			.post( runPath, {
				accept_findings: [ 'source_woocommerce_active', 'source_connection_failed' ],
			} )
			.reply( 202, running );
		mockApi().get( statusPath ).query( true ).reply( 200, running ).persist();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( run.isDone() ).toBe( true ) );
	} );

	it( 'sends a rejected connection back to the connect step', async () => {
		const failed = migration( 'failed', {
			phase: 'preflight',
			started_at: '2026-10-13T10:00:00+00:00',
			findings: [
				{ ...finding( 'source_connection_failed', 'failure' ), resolution: 'reconnect' },
			],
		} );
		mockApi().get( statusPath ).query( true ).reply( 200, failed );
		mockApi().get( configurePath ).query( true ).reply( 200, configuration );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect( await screen.findByText( 'source_connection_failed label' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Reconnect your site' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Install our plugin to start the migration' } )
		).toBeVisible();
		expect( screen.queryByText( 'source_connection_failed label' ) ).not.toBeInTheDocument();
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

	it( 'tells people who can’t manage the migration that one is underway', async () => {
		mockApi().get( statusPath ).query( true ).reply( 403, { code: 'rest_forbidden' } );

		render( <WordPressMigration site={ site } />, { queryClient } );

		expect(
			await screen.findByRole( 'heading', { name: 'A migration to this site is underway' } )
		).toBeVisible();
		expect( screen.queryByText( /We couldn’t load your migration/ ) ).not.toBeInTheDocument();
	} );
} );

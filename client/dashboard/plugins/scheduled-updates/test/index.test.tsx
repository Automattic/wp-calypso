/**
 * @vitest-environment jsdom
 */
import { createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { createPluginsRoutes } from '../../../app/router/plugins';
import { rootRoute } from '../../../app/router/root';
import { render } from '../../../test-utils';
import PluginsScheduledUpdates from '../index';

const API_BASE = 'https://public-api.wordpress.com';

const site = {
	ID: 1,
	name: 'Site A',
	slug: 'site-a.example',
	URL: 'https://site-a.example',
	site_migration: {},
};

const schedules = {
	sites: {
		1: {
			abc123: {
				timestamp: 1767225600,
				schedule: 'daily',
				interval: 86400,
				last_run_timestamp: null,
				active: true,
				args: [ 'akismet/akismet.php' ],
			},
		},
	},
};

// The header button and the rows link to routes whose paths only resolve once
// a router builds the real route tree. The router is never navigated.
beforeAll( () => {
	createRouter( {
		routeTree: rootRoute.addChildren( createPluginsRoutes() ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
} );

function mockSites() {
	nock( API_BASE )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [ site ], total: 1 } );
	nock( API_BASE )
		.get( /\/sites\/1\/plugins/ )
		.query( true )
		.reply( 200, [] );
}

// Hold the schedules request open until the returned function is called, so a
// test can check what the page shows while that request is still loading.
function mockSchedulesPending( response: object ) {
	let release: () => void = () => {};
	const gate = new Promise< void >( ( resolve ) => {
		release = resolve;
	} );
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/update-schedules' )
		.query( true )
		.reply( 200, async () => {
			await gate;
			return response;
		} );
	return release;
}

describe( '<PluginsScheduledUpdates>', () => {
	test( 'replaces the table with an empty state when there are no schedules', async () => {
		mockSites();
		nock( API_BASE ).get( '/wpcom/v2/hosting/update-schedules' ).query( true ).reply( 200, {} );

		render( <PluginsScheduledUpdates /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Choose when your plugins update' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Select the sites, the plugins, and how often they update.' )
		).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show the empty state while the schedules are still loading', async () => {
		mockSites();
		const release = mockSchedulesPending( schedules );

		render( <PluginsScheduledUpdates /> );

		// The sites request finishes first: the schedules request is still open.
		expect( await screen.findByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();

		release();

		expect( await screen.findByText( 'Site A' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
	} );

	test( 'does not show the empty state when the schedules fail to load', async () => {
		mockSites();
		nock( API_BASE ).get( '/wpcom/v2/hosting/update-schedules' ).query( true ).reply( 500, {} );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'No scheduled updates yet.' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the table and shows a search empty state when no schedule matches', async () => {
		const user = userEvent.setup();
		mockSites();
		nock( API_BASE )
			.get( '/wpcom/v2/hosting/update-schedules' )
			.query( true )
			.reply( 200, schedules );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'Site A' ) ).toBeVisible();

		await user.type( screen.getByRole( 'searchbox', { name: 'Search' } ), 'nomatch' );

		expect(
			await screen.findByRole( 'heading', { name: 'No schedules match your search' } )
		).toBeVisible();
		expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
	} );

	test( 'shows a filters empty state when no schedule matches the active filter', async () => {
		const user = userEvent.setup();
		mockSites();
		nock( API_BASE )
			.get( '/wpcom/v2/hosting/update-schedules' )
			.query( true )
			.reply( 200, schedules );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'Site A' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Frequency' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'Weekly' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'No schedules match your filters' } )
		).toBeVisible();
		expect( screen.getByText( 'Try different filters, or reset them.' ) ).toBeVisible();
	} );
} );

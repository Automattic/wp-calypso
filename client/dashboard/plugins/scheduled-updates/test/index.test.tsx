/**
 * @vitest-environment jsdom
 */
import { createRouter } from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
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
	const scope = nock( API_BASE )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [ site ], total: 1 } );
	nock( API_BASE )
		.get( /\/sites\/1\/plugins/ )
		.query( true )
		.reply( 200, [] );
	return scope;
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
	test( 'shows a full-page empty state with one next step when there are no schedules', async () => {
		mockSites();
		nock( API_BASE ).get( '/wpcom/v2/hosting/update-schedules' ).query( true ).reply( 200, {} );

		render( <PluginsScheduledUpdates /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Choose when your plugins update' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Updates run daily or weekly, at the time you pick.' )
		).toBeVisible();
		expect(
			screen.getByText( 'Select the sites, the plugins, and how often they update.' )
		).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();

		// One link only: the button of the next step. The header has none.
		const newScheduleLinks = screen.getAllByRole( 'link', { name: 'New schedule' } );
		expect( newScheduleLinks ).toHaveLength( 1 );
		expect( newScheduleLinks[ 0 ] ).toHaveAttribute( 'href', '/plugins/scheduled-updates/new' );
	} );

	test( 'shows the header button and the table when there are schedules', async () => {
		mockSites();
		nock( API_BASE )
			.get( '/wpcom/v2/hosting/update-schedules' )
			.query( true )
			.reply( 200, schedules );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'Site A' ) ).toBeVisible();
		expect( screen.getByRole( 'table' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
	} );

	test( 'does not show the empty state while the schedules are still loading', async () => {
		const sitesScope = mockSites();
		const release = mockSchedulesPending( {} );

		render( <PluginsScheduledUpdates /> );

		// The sites request finishes first: the schedules request is still open.
		expect( await screen.findByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		await waitFor( () => expect( sitesScope.isDone() ).toBe( true ) );
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();

		release();

		expect(
			await screen.findByRole( 'heading', { name: 'Choose when your plugins update' } )
		).toBeVisible();
	} );

	test( 'does not show the empty state when the sites fail to load', async () => {
		nock( API_BASE ).get( '/rest/v1.2/me/sites' ).query( true ).reply( 500, {} );
		const schedulesScope = nock( API_BASE )
			.get( '/wpcom/v2/hosting/update-schedules' )
			.query( true )
			.reply( 200, {} );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( schedulesScope.isDone() ).toBe( true );
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
	} );

	test( 'records a Tracks event when the next step button is clicked', async () => {
		const user = userEvent.setup();
		mockSites();
		nock( API_BASE ).get( '/wpcom/v2/hosting/update-schedules' ).query( true ).reply( 200, {} );

		const { recordTracksEvent } = render( <PluginsScheduledUpdates /> );

		// The header button shows while loading: wait for the empty state first.
		expect(
			await screen.findByRole( 'heading', { name: 'Choose when your plugins update' } )
		).toBeVisible();
		await user.click( screen.getByRole( 'link', { name: 'New schedule' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_plugins_scheduled_updates_empty_state_action_click',
			{ action: 'new-schedule' }
		);
	} );

	test( 'does not show the empty state when the schedules fail to load', async () => {
		mockSites();
		nock( API_BASE ).get( '/wpcom/v2/hosting/update-schedules' ).query( true ).reply( 500, {} );

		render( <PluginsScheduledUpdates /> );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Choose when your plugins update' } )
		).not.toBeInTheDocument();
		expect( screen.queryByText( 'No scheduled updates yet.' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the toolbar and the header button when no schedule matches the search', async () => {
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
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();
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
		expect( screen.getByRole( 'link', { name: 'New schedule' } ) ).toBeVisible();
	} );
} );

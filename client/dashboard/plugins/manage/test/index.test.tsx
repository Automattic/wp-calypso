/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render as testingLibraryRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { AnalyticsProvider } from '../../../app/analytics';
import { AuthContext } from '../../../app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { createPluginsRoutes } from '../../../app/router/plugins';
import { rootRoute } from '../../../app/router/root';
import { render } from '../../../test-utils';
import PluginsList from '../index';
import type { User } from '@automattic/api-core';

// Plugin rows link to `pluginRoute`, whose path is only resolved once a router
// builds the real route tree. The router is never navigated.
beforeAll( () => {
	createRouter( {
		routeTree: rootRoute.addChildren( createPluginsRoutes() ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
} );

// The shared test-utils router has no `$pluginId` route, so render a direct
// plugin link with a router of its own.
function renderAtPluginUrl( pluginSlug: string ) {
	const root = createRootRoute( { component: Outlet } );
	const pluginUrlRoute = createRoute( {
		getParentRoute: () => root,
		path: 'plugins/manage/$pluginId',
		component: PluginsList,
	} );
	const router = createRouter( {
		routeTree: root.addChildren( [ pluginUrlRoute ] ),
		history: createMemoryHistory( { initialEntries: [ `/plugins/manage/${ pluginSlug }` ] } ),
	} );

	return testingLibraryRender(
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
					<AuthContext.Provider value={ { user: { ID: 1 } as User, logout: jest.fn() } }>
						<RouterProvider router={ router } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

const pluginSite = {
	ID: 1,
	name: 'Site',
	URL: 'https://site.example',
	capabilities: { update_plugins: true },
};

// Holds the plugins request open until the returned `release` is called, so tests can check
// what the page renders while plugins are still loading.
let releasePlugins: () => void = () => {};

afterEach( () => releasePlugins() );

function mockApiEndpoints( {
	sites,
	plugins,
	pluginsStatus = 200,
	holdPlugins = false,
}: {
	sites: Record< string, unknown >[];
	plugins: Record< string, unknown[] >;
	pluginsStatus?: number;
	holdPlugins?: boolean;
} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites } );

	const pluginsScope = nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true );

	if ( holdPlugins ) {
		pluginsScope.reply( ( _uri, _body, callback ) => {
			releasePlugins = () => callback( null, [ pluginsStatus, { sites: plugins } ] );
		} );
	} else {
		pluginsScope.reply( pluginsStatus, { sites: plugins } );
	}

	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/marketplace/products' )
		.query( true )
		.reply( 200, { results: {} } )
		.persist();

	nock( 'https://public-api.wordpress.com' )
		.get( /\/wpcom\/v2\/marketplace\/search/ )
		.query( true )
		.reply( 200, { data: { results: [] } } )
		.persist();

	nock( 'https://api.wordpress.org' )
		.get( '/plugins/info/1.2/' )
		.query( true )
		.reply( 200, {} )
		.persist();
}

describe( '<PluginsList> empty states', () => {
	test( 'asks users without a site to create one', async () => {
		mockApiEndpoints( { sites: [], plugins: {} } );

		render( <PluginsList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'You need a site to install a plugin' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Start now' } ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin not found' ) ).not.toBeInTheDocument();
	} );

	test( 'points users with sites but no plugins to the plugin directory', async () => {
		mockApiEndpoints( { sites: [ pluginSite ], plugins: { '1': [] } } );

		render( <PluginsList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No plugins installed yet' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Browse plugins' } ) ).toBeVisible();
		expect( screen.queryByText( 'Plugin not found' ) ).not.toBeInTheDocument();
	} );

	test( 'does not list plugins from sites the user cannot manage', async () => {
		mockApiEndpoints( {
			sites: [ { ...pluginSite, capabilities: { update_plugins: false } } ],
			plugins: {
				'1': [ { id: 'test-plugin/test-plugin.php', slug: 'test-plugin', name: 'Test Plugin' } ],
			},
		} );

		render( <PluginsList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No plugins installed yet' } )
		).toBeVisible();
		expect( screen.getByText( 'Plugins on sites you can manage will appear here.' ) ).toBeVisible();
	} );

	test( 'does not show an empty state when plugins fail to load', async () => {
		mockApiEndpoints( { sites: [ pluginSite ], plugins: {}, pluginsStatus: 500 } );

		render( <PluginsList /> );

		expect(
			await screen.findByText( 'Couldn’t load your plugins. Please try again later.' )
		).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No plugins installed yet' } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the plugin details on a direct plugin link when the user has sites', async () => {
		mockApiEndpoints( { sites: [ pluginSite ], plugins: { '1': [] } } );

		renderAtPluginUrl( 'akismet' );

		// Wait for the loaded plugin list so the assertions don't run against the loading state.
		expect( await screen.findByText( 'No plugins found.' ) ).toBeVisible();
		expect( screen.getByRole( 'tab', { name: /Available on/ } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No plugins installed yet' } )
		).not.toBeInTheDocument();
	} );

	test( 'asks users without a site to create one on a direct plugin link', async () => {
		mockApiEndpoints( { sites: [], plugins: {} } );

		renderAtPluginUrl( 'akismet' );

		expect(
			await screen.findByRole( 'heading', { name: 'You need a site to install a plugin' } )
		).toBeVisible();
	} );

	test( 'keeps the plugin list when a search has no matches', async () => {
		const user = userEvent.setup();
		mockApiEndpoints( {
			sites: [ { ...pluginSite, site_migration: {} } ],
			plugins: {
				'1': [ { id: 'test-plugin/test-plugin.php', slug: 'test-plugin', name: 'Test Plugin' } ],
			},
		} );

		render( <PluginsList /> );

		expect( ( await screen.findAllByText( 'Test Plugin' ) )[ 0 ] ).toBeVisible();

		await user.type( screen.getAllByRole( 'searchbox' )[ 0 ], 'zzznotarealplugin' );

		expect( await screen.findByText( 'No plugins found.' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No plugins installed yet' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows the no-site empty state without waiting for plugins', async () => {
		mockApiEndpoints( { sites: [], plugins: {}, holdPlugins: true } );

		render( <PluginsList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'You need a site to install a plugin' } )
		).toBeVisible();
		expect( screen.queryByRole( 'tab', { name: /Available on/ } ) ).not.toBeInTheDocument();
	} );

	test( 'shows the no-plugins empty state without waiting for plugins when no site can manage plugins', async () => {
		mockApiEndpoints( {
			sites: [ { ...pluginSite, capabilities: { update_plugins: false } } ],
			plugins: {},
			holdPlugins: true,
		} );

		render( <PluginsList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No plugins installed yet' } )
		).toBeVisible();
		expect( screen.queryByRole( 'tab', { name: /Available on/ } ) ).not.toBeInTheDocument();
	} );

	test( 'waits for plugins before showing an empty state when a site can manage plugins', async () => {
		mockApiEndpoints( { sites: [ pluginSite ], plugins: { '1': [] }, holdPlugins: true } );

		render( <PluginsList /> );

		expect( await screen.findByRole( 'tab', { name: /Available on/ } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No plugins installed yet' } )
		).not.toBeInTheDocument();

		releasePlugins();

		expect(
			await screen.findByRole( 'heading', { name: 'No plugins installed yet' } )
		).toBeVisible();
	} );
} );

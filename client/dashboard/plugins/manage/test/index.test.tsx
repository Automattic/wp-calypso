/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PluginsList from '../index';

const pluginSite = {
	ID: 1,
	name: 'Site',
	URL: 'https://site.example',
	capabilities: { update_plugins: true },
};

function mockApiEndpoints( {
	sites,
	plugins,
	pluginsStatus = 200,
}: {
	sites: Record< string, unknown >[];
	plugins: Record< string, unknown[] >;
	pluginsStatus?: number;
} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true )
		.reply( pluginsStatus, { sites: plugins } );

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
} );

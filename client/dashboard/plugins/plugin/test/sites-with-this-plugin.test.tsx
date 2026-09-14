/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { PluginSites } from '../../manage/components/plugin-sites';
import type { PluginsResponse, Site } from '@automattic/api-core';

const PLUGIN_SLUG = 'test-plugin';
const PLUGIN_ID = 'test-plugin/test-plugin.php';
const API = 'https://public-api.wordpress.com';

function makeSite( id: number, name: string ): Site {
	return {
		ID: id,
		name,
		slug: `${ name.toLowerCase().replace( /\s+/g, '-' ) }.wordpress.com`,
		URL: `https://${ name.toLowerCase().replace( /\s+/g, '-' ) }.wordpress.com`,
		jetpack: true,
		is_wpcom_atomic: false,
		is_coming_soon: false,
		is_private: false,
		site_migration: {},
		capabilities: { update_plugins: true },
		plan: { product_slug: 'business-bundle', features: { active: [] } },
	} as unknown as Site;
}

function makePluginEntry() {
	return {
		slug: PLUGIN_SLUG,
		id: PLUGIN_ID,
		name: 'Test Plugin',
		author: 'Test Author',
		active: false,
		autoupdate: false,
		update: null,
		version: '1.0.0',
		network: false,
		is_managed: false,
	};
}

/**
 * Mock every endpoint the plugin screen reads, plus the three write endpoints a
 * delete triggers on site 1 (deactivate + disable-autoupdate share the plugin
 * path; remove hits `/delete`). `removeStatus` controls whether the remove
 * succeeds or fails so a test can exercise the partial/failed-delete path.
 */
function mockEndpoints( { removeStatus }: { removeStatus: number } ) {
	const pluginsResponse: PluginsResponse = {
		sites: {
			1: [ makePluginEntry() ],
			2: [ makePluginEntry() ],
		},
	} as unknown as PluginsResponse;

	nock( API )
		.persist()
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true )
		.reply( 200, pluginsResponse );
	nock( API )
		.persist()
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [ makeSite( 1, 'Test Site One' ), makeSite( 2, 'Test Site Two' ) ] } );
	nock( API )
		.persist()
		.get( '/wpcom/v2/marketplace/products' )
		.query( true )
		.reply( 200, { results: {} } );
	nock( API )
		.persist()
		.get( /\/rest\/v1\.2\/sites\/\d+\/plugins\/test-plugin$/ )
		.query( true )
		.reply( 200, {} );
	nock( 'https://api.wordpress.org' )
		.persist()
		.get( '/plugins/info/1.2/' )
		.query( true )
		.reply( 200, {} );

	// Deactivate + disable-autoupdate both POST to the plugin path; always succeed.
	nock( API )
		.persist()
		.post( /\/sites\/1\/plugins\/[^/]+$/ )
		.query( true )
		.reply( 200, {} );
	// Remove.
	nock( API )
		.post( /\/sites\/1\/plugins\/[^/]+\/delete$/ )
		.query( true )
		.reply( removeStatus, {} );
}

async function openDeleteModalForSiteOne( user: ReturnType< typeof userEvent.setup > ) {
	const table = await screen.findByRole( 'table' );
	await waitFor( () =>
		expect( within( table ).getByRole( 'link', { name: /Test Site One/ } ) ).toBeVisible()
	);

	const row = within( table )
		.getAllByRole( 'row' )
		.find( ( r ) => within( r ).queryByRole( 'link', { name: /Test Site One/ } ) );
	await user.click( within( row! ).getByRole( 'button', { name: 'Actions' } ) );

	await user.click( await screen.findByRole( 'menuitem', { name: 'Delete' } ) );

	const dialog = await screen.findByRole( 'dialog' );
	await user.click( within( dialog ).getByRole( 'button', { name: 'Delete' } ) );

	await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
}

describe( '<SitesWithThisPlugin> delete flow', () => {
	test( 'keeps the site visible when its delete fails', async () => {
		const user = userEvent.setup();
		mockEndpoints( { removeStatus: 500 } );

		render( <PluginSites selectedPluginSlug={ PLUGIN_SLUG } /> );

		await openDeleteModalForSiteOne( user );

		expect( await screen.findByRole( 'link', { name: /Test Site One/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Test Site Two/ } ) ).toBeVisible();
	} );

	test( 'removes only the deleted site when its delete succeeds', async () => {
		const user = userEvent.setup();
		mockEndpoints( { removeStatus: 200 } );

		render( <PluginSites selectedPluginSlug={ PLUGIN_SLUG } /> );

		await openDeleteModalForSiteOne( user );

		await waitFor( () =>
			expect( screen.queryByRole( 'link', { name: /Test Site One/ } ) ).not.toBeInTheDocument()
		);
		expect( screen.getByRole( 'link', { name: /Test Site Two/ } ) ).toBeVisible();
	} );
} );

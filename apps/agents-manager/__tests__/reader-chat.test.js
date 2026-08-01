/**
 * @jest-environment jsdom
 *
 * Tests for the pure helper functions exported from reader-chat.js.
 *
 * The file is an entry point with heavy side-effecting top-level code
 * (DOM mounting, global mutation). We mock all heavy imports and the
 * DOM entry point so only the three pure helpers are exercised.
 */

// Mock the side-effecting imports before any module load.
jest.mock( '../config', () => {}, { virtual: true } );
jest.mock( '@automattic/agents-manager', () => ( { default: () => null } ), { virtual: true } );
jest.mock(
	'@automattic/agents-manager/src/auth/calypso-auth-provider',
	() => ( {
		createCalypsoAuthProvider: jest.fn( ( siteId ) => async () => ( {
			'Content-Type': 'application/json',
			Authorization: `Bearer test-token-${ siteId }`,
		} ) ),
	} ),
	{ virtual: true }
);
jest.mock(
	'@tanstack/react-query',
	() => ( {
		QueryClient: jest.fn( () => ( {} ) ),
		QueryClientProvider: ( { children } ) => children,
	} ),
	{ virtual: true }
);
jest.mock(
	'@wordpress/element',
	() => {
		const element = jest.requireActual( '@wordpress/element' );
		return {
			...element,
			useState: jest.requireActual( 'react' ).useState,
			useEffect: jest.requireActual( 'react' ).useEffect,
		};
	},
	{ virtual: true }
);
jest.mock(
	'react-dom/client',
	() => ( { createRoot: jest.fn( () => ( { render: jest.fn() } ) ) } ),
	{ virtual: true }
);

// Provide a minimal JetpackReaderChatConfig so the module-level readerConfig
// is safe to read (no currentPost by default — exercises the no-post branch).
let getElementByIdSpy;
const getElementById = document.getElementById.bind( document );

beforeAll( () => {
	globalThis.window.JetpackReaderChatConfig = {};
	// Suppress the top-level DOM mount — the container lookup returns null so
	// the `if ( container )` branch is skipped entirely.
	getElementByIdSpy = jest.spyOn( document, 'getElementById' ).mockReturnValue( null );
} );

// Import after mocks are registered.
const {
	createCalypsoAuthProvider,
} = require( '@automattic/agents-manager/src/auth/calypso-auth-provider' );
const {
	parseAgentSseResponse,
	slugify,
	getFallbackSuggestions,
	isCollapsedLauncherTarget,
	normalizeReaderSiteId,
	decodeHtmlEntities,
	getReaderEmptyViewHeading,
	getAccessibleColor,
	getReaderClientContext,
	normalizeSuggestions,
	parseSuggestionsResponse,
	getSuggestionsFetchHeaders,
	injectScopedReset,
	injectBrandTokens,
	watchFirstChatOpen,
} = require( '../reader-chat' );

// ---------------------------------------------------------------------------
// injectScopedReset
// ---------------------------------------------------------------------------

describe( 'injectScopedReset', () => {
	beforeEach( () => {
		document.head.querySelector( '#jetpack-reader-chat-reset' )?.remove();
		getElementByIdSpy.mockImplementation( getElementById );
	} );

	afterEach( () => {
		getElementByIdSpy.mockReturnValue( null );
	} );

	it( 'pins widget typography and resets leaked theme button styles', () => {
		injectScopedReset();

		const css = document.head.querySelector( '#jetpack-reader-chat-reset' ).textContent;

		expect( css ).toContain( 'font-size: var( --base-font-size, 16px ) !important;' );
		expect( css ).toContain( '--base-font-size: 16px !important;' );
		expect( css ).toContain( 'font-family: var( --reader-chat-font-family,' );
		expect( css ).toContain( '.agents-manager-chat [data-slot="message"][data-role="user"]' );
		expect( css ).toContain(
			'--color-foreground: var( --reader-chat-user-message-foreground, #1f1f1f );'
		);
		expect( css ).toContain( '.agents-manager-chat [data-slot="message"][data-role="user"] a' );
		expect( css ).toContain( 'text-decoration: underline !important;' );
		expect( css ).toContain(
			'.agents-manager-chat .components-button.has-icon:not(.components-dropdown-menu__menu-item)'
		);
		expect( css ).toContain(
			'.agents-manager-chat .agents-manager-chat-header .components-button.has-icon:not(.components-dropdown-menu__menu-item)'
		);
		expect( css ).toContain(
			'.agents-manager-chat .agents-manager-copy-action-button.components-button.has-icon'
		);
		expect( css ).toContain( 'text-transform: none !important;' );
		expect( css ).toContain( 'letter-spacing: inherit !important;' );
		expect( css ).toContain( '.agents-manager-chat textarea::placeholder' );
		expect( css ).toContain( 'background: transparent !important;' );
		expect( css ).toContain( 'color: var( --color-foreground, #1e1e1e ) !important;' );
		expect( css ).toContain(
			'background: var( --reader-chat-control-hover, var( --color-muted, rgba( 0, 0, 0, 0.06 ) ) ) !important;'
		);
		expect( css ).toContain( ':not([aria-disabled="true"])' );
		expect( css ).toContain( '.agents-manager-chat-header__menu-popover' );
		expect( css ).toContain(
			'.agents-manager-chat .agents-manager-chat-header .components-dropdown-menu__menu .components-dropdown-menu__menu-item'
		);
		expect( css ).toContain( 'white-space: nowrap !important;' );
		expect( css ).toContain(
			'.agents-manager-chat-header__menu-popover .components-dropdown-menu__menu-item[aria-disabled="true"]'
		);
		expect( css ).toContain( 'cursor: default !important;' );
		expect( css ).toContain( 'opacity: 0.5 !important;' );
		expect( css ).toContain(
			'.agents-manager-chat-header__menu-popover .components-popover__content'
		);
		expect( css ).toContain(
			'.agents-manager-chat-header__menu-popover .components-dropdown-menu__menu-item:focus-visible'
		);
		expect( css ).toContain( 'outline: 2px solid var( --reader-chat-menu-focus ) !important;' );
		expect( css ).not.toMatch( /^\s*\.components-popover\s*\{/m );
		expect( css ).not.toMatch( /--reader-chat-font-family\s*:/ );
	} );

	it( 'does not inject duplicate reset styles', () => {
		injectScopedReset();
		injectScopedReset();

		expect( document.head.querySelectorAll( '#jetpack-reader-chat-reset' ) ).toHaveLength( 1 );
	} );
} );

// ---------------------------------------------------------------------------
// parseAgentSseResponse
// ---------------------------------------------------------------------------

describe( 'parseAgentSseResponse', () => {
	function makeEvent( text ) {
		const payload = {
			jsonrpc: '2.0',
			result: {
				status: {
					message: {
						parts: [ { type: 'text', text } ],
					},
				},
			},
		};
		return `data: ${ JSON.stringify( payload ) }\n`;
	}

	it( 'extracts text from a valid JSON-RPC SSE event', () => {
		const raw = makeEvent( 'Hello, reader!' );
		expect( parseAgentSseResponse( raw ) ).toBe( 'Hello, reader!' );
	} );

	it( 'returns `null` for malformed JSON in the data line', () => {
		expect( parseAgentSseResponse( 'data: not-valid-json\n' ) ).toBeNull();
	} );

	it( 'skips non-data lines and still finds the text part', () => {
		const raw = `event: message\nid: 1\n${ makeEvent( 'Found it' ) }`;
		expect( parseAgentSseResponse( raw ) ).toBe( 'Found it' );
	} );

	it( 'returns `null` when input has no data lines', () => {
		expect( parseAgentSseResponse( 'event: ping\n' ) ).toBeNull();
	} );

	it( "skips the '[DONE]' sentinel line and falls through to null", () => {
		expect( parseAgentSseResponse( 'data: [DONE]\n' ) ).toBeNull();
	} );

	it( 'returns text from the first matching data line when multiple are present', () => {
		const raw = `${ makeEvent( 'First' ) }${ makeEvent( 'Second' ) }`;
		expect( parseAgentSseResponse( raw ) ).toBe( 'First' );
	} );

	it( 'returns `null` when `parts` array is empty', () => {
		const payload = { result: { status: { message: { parts: [] } } } };
		expect( parseAgentSseResponse( `data: ${ JSON.stringify( payload ) }\n` ) ).toBeNull();
	} );

	it( 'returns `null` when `parts` contains only non-text entries', () => {
		const payload = {
			result: { status: { message: { parts: [ { type: 'data', data: {} } ] } } },
		};
		expect( parseAgentSseResponse( `data: ${ JSON.stringify( payload ) }\n` ) ).toBeNull();
	} );

	it( 'handles CRLF line endings', () => {
		const raw = makeEvent( 'CRLF text' ).replace( /\n/g, '\r\n' );
		expect( parseAgentSseResponse( raw ) ).toBe( 'CRLF text' );
	} );
} );

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

describe( 'slugify', () => {
	it( 'lowercases the label', () => {
		expect( slugify( 'Hello World' ) ).toBe( 'hello-world' );
	} );

	it( 'replaces spaces with dashes', () => {
		expect( slugify( 'foo bar baz' ) ).toBe( 'foo-bar-baz' );
	} );

	it( 'strips non-alphanumeric characters', () => {
		expect( slugify( 'What is this?!' ) ).toBe( 'what-is-this' );
	} );

	it( 'collapses multiple non-alphanumeric chars into a single dash', () => {
		expect( slugify( 'hello---world' ) ).toBe( 'hello-world' );
	} );

	it( 'strips leading and trailing dashes', () => {
		expect( slugify( '  trim me  ' ) ).toBe( 'trim-me' );
	} );

	it( 'truncates to 40 characters', () => {
		const label = 'a'.repeat( 50 );
		expect( slugify( label ) ).toHaveLength( 40 );
	} );

	it( 'handles an empty string', () => {
		expect( slugify( '' ) ).toBe( '' );
	} );

	it( 'handles null / undefined gracefully', () => {
		expect( slugify( null ) ).toBe( '' );
		expect( slugify( undefined ) ).toBe( '' );
	} );
} );

// ---------------------------------------------------------------------------
// normalizeReaderSiteId
// ---------------------------------------------------------------------------

describe( 'normalizeReaderSiteId', () => {
	it( 'accepts numeric site IDs', () => {
		expect( normalizeReaderSiteId( 247750866 ) ).toBe( 247750866 );
	} );

	it( 'coerces localized string site IDs to numbers', () => {
		expect( normalizeReaderSiteId( '247750866' ) ).toBe( 247750866 );
	} );

	it( 'rejects missing or invalid site IDs', () => {
		expect( normalizeReaderSiteId( undefined ) ).toBeUndefined();
		expect( normalizeReaderSiteId( 'site-id' ) ).toBeUndefined();
		expect( normalizeReaderSiteId( 0 ) ).toBeUndefined();
	} );
} );

// ---------------------------------------------------------------------------
// decodeHtmlEntities
// ---------------------------------------------------------------------------

describe( 'decodeHtmlEntities', () => {
	it( 'decodes encoded punctuation and non-breaking spaces from post titles', () => {
		expect( decodeHtmlEntities( 'The Fisherman Who Won&#8217;t Take&nbsp;Tips' ) ).toBe(
			'The Fisherman Who Won’t Take Tips'
		);
	} );
} );

// ---------------------------------------------------------------------------
// getReaderEmptyViewHeading
// ---------------------------------------------------------------------------

describe( 'getReaderEmptyViewHeading', () => {
	it( 'uses post-specific copy on singular posts', () => {
		expect( getReaderEmptyViewHeading( { currentPost: { id: 1 } } ) ).toBe(
			'Ask me anything about this post.'
		);
	} );

	it( 'uses blog copy when no post is selected', () => {
		expect( getReaderEmptyViewHeading( {} ) ).toBe( 'Ask me anything about this blog.' );
	} );

	it( 'uses blog copy when the current post is the static front page', () => {
		expect(
			getReaderEmptyViewHeading( {
				siteUrl: 'https://example.com/',
				currentPost: { id: 1, title: 'Home', url: 'https://example.com/' },
			} )
		).toBe( 'Ask me anything about this blog.' );
	} );

	it( 'prefers an owner-set greeting over the contextual default', () => {
		expect(
			getReaderEmptyViewHeading( {
				currentPost: { id: 1 },
				brand: { greeting: 'What can I find for you?' },
			} )
		).toBe( 'What can I find for you?' );
	} );

	it( 'falls back to contextual copy when the brand carries no greeting', () => {
		expect( getReaderEmptyViewHeading( { brand: {} } ) ).toBe( 'Ask me anything about this blog.' );
	} );
} );

// ---------------------------------------------------------------------------
// injectBrandTokens
// ---------------------------------------------------------------------------

describe( 'injectBrandTokens', () => {
	beforeEach( () => {
		document.head.querySelector( '#jetpack-reader-chat-brand' )?.remove();
		getElementByIdSpy.mockImplementation( getElementById );
	} );

	afterEach( () => {
		document.head.querySelector( '#agenttic-test-defaults' )?.remove();
		document.body.querySelector( '.agents-manager-chat' )?.remove();
		getElementByIdSpy.mockReturnValue( null );
	} );

	it( 'emits nothing when the site has no appearance overrides', () => {
		injectBrandTokens( {} );
		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ) ).toBeNull();
	} );

	it( 'emits nothing when there is no brand at all', () => {
		injectBrandTokens( undefined );
		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ) ).toBeNull();
	} );

	it( 'sets the accent tokens from the brand', () => {
		injectBrandTokens( { accent: '#2271b1', accentForeground: '#ffffff' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '--color-primary: #2271b1;' );
		expect( css ).toContain( '--color-primary-foreground: #ffffff;' );
	} );

	it( 'sets background, accessible text, outline, and font tokens from the brand', () => {
		injectBrandTokens( {
			background: '#112233',
			outline: '#f2eff6',
			fontFamily: 'serif',
		} );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '--color-background: #112233;' );
		expect( css ).toContain( '--color-popover: #112233;' );
		expect( css ).toContain( '--color-popover-muted: color-mix(in srgb, #112233 80%, #f2eff6);' );
		expect( css ).toContain( '--color-foreground: #ffffff;' );
		expect( css ).toContain( '--color-muted-foreground: #d6d6d6;' );
		expect( css ).toContain( '--color-muted: #f2eff6;' );
		expect( css ).toContain( '--reader-chat-user-message-foreground: #1f1f1f;' );
		expect( css ).toContain( '--reader-chat-font-family: Georgia' );
		expect( css ).toContain( '--reader-chat-menu-background: #112233;' );
		expect( css ).toContain( '--reader-chat-menu-foreground: #ffffff;' );
		expect( css ).toContain(
			'--reader-chat-control-hover: color-mix( in srgb, #ffffff 14%, #112233 );'
		);
	} );

	it( 'inherits the host theme font when the site font is selected', () => {
		injectBrandTokens( { fontFamily: 'site' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '#jetpack-reader-chat *' );
		expect( css ).toContain( '.agents-manager-chat *' );
		expect( css ).toContain( 'font-family: inherit !important;' );
		expect( css ).not.toContain( '--reader-chat-font-family: inherit;' );
	} );

	it( 'ignores malformed and unsupported appearance values', () => {
		injectBrandTokens( {
			background: 'url(javascript:alert(1))',
			outline: false,
			fontFamily: 'toString',
			fontSize: 100,
		} );

		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ) ).toBeNull();
	} );

	it( 'ignores removed text color and font size values', () => {
		injectBrandTokens( { text: '#ff0000', fontSize: 15 } );

		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ) ).toBeNull();
	} );

	it( 'ignores the removed rounded font value', () => {
		injectBrandTokens( { fontFamily: 'rounded' } );

		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ) ).toBeNull();
	} );

	it( 'keeps the selected outline separate from automatic text contrast', () => {
		injectBrandTokens( { background: '#ffffff', outline: '#f2eff6' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '--color-muted: #f2eff6;' );
		expect( css ).toContain( '--color-foreground: #000000;' );
		expect( css ).toContain( '--color-muted-foreground: #595959;' );
	} );

	it( 'uses light text on a dark outgoing message bubble', () => {
		injectBrandTokens( { background: '#ffffff', outline: '#222222' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '--reader-chat-user-message-foreground: #ffffff;' );
	} );

	it( 'keeps the default light outgoing bubble readable with a dark panel', () => {
		injectBrandTokens( { background: '#112233' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).not.toContain( '--color-muted:' );
		expect( css ).toContain( '--reader-chat-user-message-foreground: #1f1f1f;' );
	} );

	it( 'overrides the default token defined directly on the Agenttic widget', () => {
		const defaults = document.createElement( 'style' );
		defaults.id = 'agenttic-test-defaults';
		defaults.textContent = '.agenttic { --color-primary: #2d5af2; }';
		document.head.appendChild( defaults );

		const portal = document.createElement( 'div' );
		portal.className = 'agents-manager-chat';
		portal.innerHTML = '<div class="agenttic"></div>';
		document.body.appendChild( portal );

		injectBrandTokens( { accent: '#2271b1', accentForeground: '#ffffff' } );

		expect(
			window
				.getComputedStyle( portal.querySelector( '.agenttic' ) )
				.getPropertyValue( '--color-primary' )
		).toBe( '#2271b1' );
	} );

	it( 'targets the portalled selectors, since the panel mounts on body', () => {
		injectBrandTokens( { accent: '#2271b1', accentForeground: '#ffffff' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '.agents-manager-chat' );
		expect( css ).toContain( '.agents-manager-chat .agenttic' );
		expect( css ).toContain( '.agents-manager-sidebar-fab' );
		expect( css ).toContain( '.agents-manager-chat-header__menu-popover' );
		expect( css ).not.toContain( '.components-popover {' );
	} );

	it( 'never defines the tokens globally, which would restyle the host theme', () => {
		injectBrandTokens( { accent: '#2271b1', accentForeground: '#ffffff' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).not.toMatch( /:root/ );
		expect( css ).not.toMatch( /(^|[^-\w])html\s*[,{]/ );
	} );

	it( 'defaults the foreground when an older deploy sends an accent without one', () => {
		injectBrandTokens( { accent: '#2271b1' } );

		const css = document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent;
		expect( css ).toContain( '--color-primary-foreground: #ffffff;' );
	} );

	it( 'does not inject twice', () => {
		injectBrandTokens( { accent: '#2271b1', accentForeground: '#ffffff' } );
		injectBrandTokens( { accent: '#ff0000', accentForeground: '#000000' } );

		expect( document.head.querySelectorAll( '#jetpack-reader-chat-brand' ) ).toHaveLength( 1 );
		expect( document.head.querySelector( '#jetpack-reader-chat-brand' ).textContent ).toContain(
			'#2271b1'
		);
	} );
} );

// ---------------------------------------------------------------------------
// getAccessibleColor
// ---------------------------------------------------------------------------

describe( 'getAccessibleColor', () => {
	it( 'chooses dark text for a light background', () => {
		expect( getAccessibleColor( '#ffffff' ) ).toBe( '#000000' );
	} );

	it( 'chooses light text for a dark background', () => {
		expect( getAccessibleColor( '#700f1b' ) ).toBe( '#ffffff' );
	} );

	it( 'keeps a preferred color when it meets the requested contrast', () => {
		expect( getAccessibleColor( '#ffffff', '#3858e9', 3 ) ).toBe( '#3858e9' );
	} );

	it( 'replaces a preferred color that does not meet contrast', () => {
		expect( getAccessibleColor( '#700f1b', '#8a101e', 3 ) ).toBe( '#ffffff' );
	} );
} );

// ---------------------------------------------------------------------------
// getReaderClientContext
// ---------------------------------------------------------------------------

describe( 'getReaderClientContext', () => {
	it( 'sends selected site and current post context for server-side resolution', () => {
		const currentPost = {
			id: 123,
			title: 'Reader post',
			url: 'https://example.com/reader-post/',
		};

		expect( getReaderClientContext( currentPost, 247750866 ) ).toEqual( {
			selectedSiteId: 247750866,
			currentPost,
		} );
	} );

	it( 'omits currentPost on blog-level views', () => {
		expect( getReaderClientContext( null, 247750866 ) ).toEqual( {
			selectedSiteId: 247750866,
		} );
	} );
} );

// ---------------------------------------------------------------------------
// getSuggestionsFetchHeaders
// ---------------------------------------------------------------------------

describe( 'getSuggestionsFetchHeaders', () => {
	it( 'uses the Calypso auth provider with the selected site ID', async () => {
		await expect( getSuggestionsFetchHeaders( 247750866 ) ).resolves.toEqual( {
			'Content-Type': 'application/json',
			Authorization: 'Bearer test-token-247750866',
		} );

		expect( createCalypsoAuthProvider ).toHaveBeenCalledWith( 247750866, {
			logWpcomJwtFailure: false,
		} );
	} );
} );

// ---------------------------------------------------------------------------
// parseSuggestionsResponse
// ---------------------------------------------------------------------------

describe( 'parseSuggestionsResponse', () => {
	it( 'parses JSON arrays from plain text', () => {
		expect( parseSuggestionsResponse( '[{"label":"A","prompt":"B"}]' ) ).toEqual( [
			{ label: 'A', prompt: 'B' },
		] );
	} );

	it( 'parses JSON arrays from fenced code blocks', () => {
		expect( parseSuggestionsResponse( '```json\n[{"label":"A","prompt":"B"}]\n```' ) ).toEqual( [
			{ label: 'A', prompt: 'B' },
		] );
	} );
} );

// ---------------------------------------------------------------------------
// normalizeSuggestions
// ---------------------------------------------------------------------------

describe( 'normalizeSuggestions', () => {
	it( 'keeps a concise label separate from the submitted prompt', () => {
		expect(
			normalizeSuggestions(
				[
					{
						label: 'Trip planning',
						prompt: 'What criteria do you use to select the places you visit?',
					},
				],
				'ai-suggestion'
			)
		).toEqual( [
			{
				id: 'ai-suggestion-0-what-criteria-do-you-use-to-select-the-p',
				label: 'Trip planning',
				prompt: 'What criteria do you use to select the places you visit?',
			},
		] );
	} );

	it( 'keeps concise question labels so post-specific chips can be shown', () => {
		expect(
			normalizeSuggestions(
				[
					{
						label: 'Why refuse tips?',
						prompt: 'Why does the fisherman refuse tips in this post?',
					},
				],
				'ai-suggestion'
			)
		).toEqual( [
			{
				id: 'ai-suggestion-0-why-does-the-fisherman-refuse-tips-in-th',
				label: 'Why refuse tips?',
				prompt: 'Why does the fisherman refuse tips in this post?',
			},
		] );
	} );

	it( 'falls back to a short chip label when the returned label is empty', () => {
		expect(
			normalizeSuggestions( [ { label: ' ', prompt: 'Can you summarize this post?' } ], 'ai' )
		).toEqual( [
			{
				id: 'ai-0-can-you-summarize-this-post',
				label: 'Explore recent posts',
				prompt: 'Can you summarize this post?',
			},
		] );
	} );

	it( 'replaces overly long labels with short fallback labels', () => {
		expect(
			normalizeSuggestions(
				[
					{
						label:
							'What led you to embrace a more spontaneous and less structured style of travel?',
						prompt: 'What does this post say about spontaneous travel?',
					},
				],
				'ai'
			)
		).toEqual( [
			{
				id: 'ai-0-what-does-this-post-say-about-spontaneou',
				label: 'Explore recent posts',
				prompt: 'What does this post say about spontaneous travel?',
			},
		] );
	} );
} );

// ---------------------------------------------------------------------------
// isCollapsedLauncherTarget
// ---------------------------------------------------------------------------

describe( 'isCollapsedLauncherTarget', () => {
	it( 'matches clicks inside the collapsed launcher', () => {
		const container = document.createElement( 'div' );
		const collapsedView = document.createElement( 'div' );
		const button = document.createElement( 'button' );

		collapsedView.dataset.slot = 'collapsed-view';
		collapsedView.appendChild( button );
		container.appendChild( collapsedView );

		expect( isCollapsedLauncherTarget( button, container ) ).toBe( true );
	} );

	it( 'does not match targets outside the reader-chat container', () => {
		const container = document.createElement( 'div' );
		const collapsedView = document.createElement( 'div' );
		const button = document.createElement( 'button' );

		collapsedView.dataset.slot = 'collapsed-view';
		collapsedView.appendChild( button );

		expect( isCollapsedLauncherTarget( button, container ) ).toBe( false );
	} );

	it( 'does not match non-element targets', () => {
		const container = document.createElement( 'div' );
		const textNode = document.createTextNode( 'Open chat' );

		expect( isCollapsedLauncherTarget( textNode, container ) ).toBe( false );
	} );
} );

// ---------------------------------------------------------------------------
// getFallbackSuggestions
// ---------------------------------------------------------------------------

describe( 'getFallbackSuggestions', () => {
	it( 'returns 3 generic suggestions when no currentPost is set', () => {
		// readerConfig is captured at module-load time with JetpackReaderChatConfig = {}
		// (no currentPost), so getFallbackSuggestions returns the no-post branch.
		const suggestions = getFallbackSuggestions();
		expect( suggestions ).toHaveLength( 3 );
		expect( suggestions.map( ( s ) => s.id ) ).toEqual( [ 'recent', 'about', 'recommend' ] );
	} );

	it( 'each generic suggestion has `id`, `label`, and `prompt` strings', () => {
		const suggestions = getFallbackSuggestions();
		for ( const s of suggestions ) {
			expect( typeof s.id ).toBe( 'string' );
			expect( typeof s.label ).toBe( 'string' );
			expect( typeof s.prompt ).toBe( 'string' );
			expect( s.label.length ).toBeLessThan( s.prompt.length );
		}
	} );
} );

// ---------------------------------------------------------------------------
// watchFirstChatOpen
// ---------------------------------------------------------------------------

describe( 'watchFirstChatOpen', () => {
	// Minimal fake of the @wordpress/data store accessors: tests control
	// isOpen and trigger store-change notifications explicitly.
	const makeStore = ( initialOpen = false ) => {
		let isOpen = initialOpen;
		const listeners = new Set();
		return {
			deps: {
				select: () => ( {
					getAgentsManagerState: () => ( { isOpen } ),
				} ),
				subscribe: ( fn ) => {
					listeners.add( fn );
					return () => listeners.delete( fn );
				},
			},
			setOpen( value ) {
				isOpen = value;
				for ( const fn of [ ...listeners ] ) {
					fn();
				}
			},
			get listenerCount() {
				return listeners.size;
			},
		};
	};

	it( 'fires immediately when the chat is already open', () => {
		const store = makeStore( true );
		const onFirstOpen = jest.fn();
		watchFirstChatOpen( onFirstOpen, store.deps );
		expect( onFirstOpen ).toHaveBeenCalledTimes( 1 );
		expect( store.listenerCount ).toBe( 0 );
	} );

	it( 'does not fire while the chat stays closed', () => {
		const store = makeStore( false );
		const onFirstOpen = jest.fn();
		watchFirstChatOpen( onFirstOpen, store.deps );
		store.setOpen( false );
		expect( onFirstOpen ).not.toHaveBeenCalled();
	} );

	it( 'fires once on the first open and unsubscribes', () => {
		const store = makeStore( false );
		const onFirstOpen = jest.fn();
		watchFirstChatOpen( onFirstOpen, store.deps );

		store.setOpen( true );
		expect( onFirstOpen ).toHaveBeenCalledTimes( 1 );
		expect( store.listenerCount ).toBe( 0 );

		// Close + reopen must not re-fire.
		store.setOpen( false );
		store.setOpen( true );
		expect( onFirstOpen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'survives a store that is not registered yet', () => {
		const onFirstOpen = jest.fn();
		const deps = {
			select: () => ( {} ), // no getAgentsManagerState selector
			subscribe: () => () => {},
		};
		expect( () => watchFirstChatOpen( onFirstOpen, deps ) ).not.toThrow();
		expect( onFirstOpen ).not.toHaveBeenCalled();
	} );

	it( 'treats a select() that throws as chat-closed instead of crashing', () => {
		const onFirstOpen = jest.fn();
		const listeners = new Set();
		const deps = {
			select: () => {
				throw new Error( 'store not registered' );
			},
			subscribe: ( fn ) => {
				listeners.add( fn );
				return () => listeners.delete( fn );
			},
		};
		expect( () => watchFirstChatOpen( onFirstOpen, deps ) ).not.toThrow();
		expect( () => listeners.forEach( ( fn ) => fn() ) ).not.toThrow();
		expect( onFirstOpen ).not.toHaveBeenCalled();
	} );

	it( 'handles a subscribe implementation that fires synchronously during registration', () => {
		const onFirstOpen = jest.fn();
		const unsubscribeSpy = jest.fn();
		let isOpen = false;
		const deps = {
			select: () => ( { getAgentsManagerState: () => ( { isOpen } ) } ),
			subscribe: ( fn ) => {
				isOpen = true;
				fn();
				return unsubscribeSpy;
			},
		};
		watchFirstChatOpen( onFirstOpen, deps );
		expect( onFirstOpen ).toHaveBeenCalledTimes( 1 );
		expect( unsubscribeSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );

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
	getReaderClientContext,
	normalizeSuggestions,
	parseSuggestionsResponse,
	getSuggestionsFetchHeaders,
	injectScopedReset,
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

		expect( css ).toContain( 'font-size: 16px !important;' );
		expect( css ).toContain( '--base-font-size: 16px !important;' );
		expect( css ).toContain( '.agents-manager-chat .components-button.has-icon' );
		expect( css ).toContain(
			'.agents-manager-chat .agents-manager-copy-action-button.components-button.has-icon'
		);
		expect( css ).toContain( 'text-transform: none !important;' );
		expect( css ).toContain( 'letter-spacing: inherit !important;' );
		expect( css ).toContain( 'background: transparent !important;' );
		expect( css ).toContain( 'color: var( --color-foreground, #1e1e1e ) !important;' );
		expect( css ).toContain(
			'background: var( --color-muted, rgba( 0, 0, 0, 0.06 ) ) !important;'
		);
		expect( css ).toContain( ':not([aria-disabled="true"])' );
		expect( css ).toContain( '.agents-manager-chat-header__menu-popover' );
		expect( css ).toContain(
			'.agents-manager-chat-header__menu-popover .components-dropdown-menu__menu-item[aria-disabled="true"]'
		);
		expect( css ).toContain( 'cursor: default !important;' );
		expect( css ).toContain( 'opacity: 0.5 !important;' );
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

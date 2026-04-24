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
beforeAll( () => {
	globalThis.window.JetpackReaderChatConfig = {};
	// Suppress the top-level DOM mount — the container lookup returns null so
	// the `if ( container )` branch is skipped entirely.
	jest.spyOn( document, 'getElementById' ).mockReturnValue( null );
} );

// Import after mocks are registered.
const {
	parseAgentSseResponse,
	slugify,
	getFallbackSuggestions,
	isCollapsedLauncherTarget,
} = require( '../reader-chat' );

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
		expect( suggestions.map( ( s ) => s.id ) ).toEqual( [ 'popular', 'about', 'recommend' ] );
	} );

	it( 'each generic suggestion has `id`, `label`, and `prompt` strings', () => {
		const suggestions = getFallbackSuggestions();
		for ( const s of suggestions ) {
			expect( typeof s.id ).toBe( 'string' );
			expect( typeof s.label ).toBe( 'string' );
			expect( typeof s.prompt ).toBe( 'string' );
		}
	} );
} );

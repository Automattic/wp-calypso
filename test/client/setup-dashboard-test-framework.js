import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require( 'util' );
const nock = require( 'nock' );

// Fail any network requests which aren't mocked.
nock.disableNetConnect();

// Define TextEncoder for ReactDOMServer
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Clear the global @automattic/api-queries queryClient singleton between tests so its cache
// doesn't leak across a file — but only if the test actually loaded the real module. Some
// tests mock api-queries or its deps (or never import it), and loading it here ourselves
// would run that graph through their mocks and break them. require.cache tells us which
// tests loaded it, so we only touch the real singleton.
const apiQueriesId = require.resolve( '@automattic/api-queries' );

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
	require.cache[ apiQueriesId ]?.exports.queryClient?.clear();
} );

global.ResizeObserver = require( 'resize-observer-polyfill' );

// jsdom doesn't implement structuredClone; mirror the client test setup so
// transitively-loaded Calypso code that relies on it works under jsdom.
if ( typeof global.structuredClone !== 'function' ) {
	global.structuredClone = ( obj ) => JSON.parse( JSON.stringify( obj ) );
}

// jsdom doesn't implement IntersectionObserver, which is used by
// @wordpress/dataviews' infinite-scroll hook.
global.IntersectionObserver = class IntersectionObserver {
	constructor() {
		this.root = null;
		this.rootMargin = '';
		this.thresholds = [];
	}
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
};

// Mock @automattic/agenttic-client to resolve dependency issues
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		__esModule: true,
		getAgentManager: jest.fn( () => ( {
			createAgent: jest.fn(),
			getAgent: jest.fn(),
		} ) ),
		useAgentChat: jest.fn( () => ( {
			messages: [],
			isLoading: false,
			sendMessage: jest.fn(),
			clearMessages: jest.fn(),
		} ) ),
	} ),
	{ virtual: true }
);

// Mock @automattic/agenttic-ui to resolve dependency issues
jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		__esModule: true,
		ThinkingMessage: jest.fn( () => 'Thinking...' ),
		AgentUI: jest.fn( () => null ),
		createMessageRenderer: jest.fn(),
		EmptyView: jest.fn( () => null ),
	} ),
	{ virtual: true }
);

global.matchMedia = jest.fn( ( query ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: jest.fn(), // deprecated
	removeListener: jest.fn(), // deprecated
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	dispatchEvent: jest.fn(),
} ) );

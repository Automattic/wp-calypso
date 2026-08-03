import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require( 'util' );
const nock = require( 'nock' );

// Fail any network requests which aren't mocked.
nock.disableNetConnect();

// Define TextEncoder for ReactDOMServer
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @automattic/api-queries exposes a module-level singleton queryClient whose cache can
// leak between tests in the same file. Clear it after each test, but never load it here:
// the module drags in the api-core / react-query graph, so loading it ourselves would
// resolve those deps around whatever the test has mocked and break either construction
// or the test's mocks. Instead, clear it only when the test itself already loaded it.
const apiQueriesId = require.resolve( '@automattic/api-queries' );

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
	require.cache[ apiQueriesId ]?.exports.queryClient.clear();
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

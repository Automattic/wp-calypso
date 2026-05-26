import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require( 'util' );
const nock = require( 'nock' );

// Fail any network requests which aren't mocked.
nock.disableNetConnect();

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
} );

// Define TextEncoder for ReactDOMServer
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom doesn't expose fetch on its global, so tests that go through native
// fetch() (e.g. wp.org REST endpoints) need a polyfill. node-fetch is the
// closest fit because nock can intercept it.
if ( typeof global.fetch === 'undefined' ) {
	const nodeFetch = require( 'node-fetch' );
	global.fetch = nodeFetch.default;
	global.Headers = nodeFetch.Headers;
	global.Request = nodeFetch.Request;
	global.Response = nodeFetch.Response;
}

global.ResizeObserver = require( 'resize-observer-polyfill' );

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

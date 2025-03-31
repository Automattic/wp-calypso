import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require( 'util' );
const nock = require( 'nock' );

// Disables all network requests for all tests.
nock.disableNetConnect();

beforeAll( () => {
	// reactivate nock on test start
	if ( ! nock.isActive() ) {
		nock.activate();
	}
} );

afterAll( () => {
	// helps clean up nock after each test run and avoid memory leaks
	nock.restore();
	nock.cleanAll();
} );

// Define TextEncoder for ReactDOMServer
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// This is used by @wordpress/components in https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/ui/utils/space.ts#L33
// JSDOM or CSSDOM don't provide an implementation for it, so for now we have to mock it.
global.CSS = {
	supports: jest.fn(),
};

global.fetch = jest.fn( () =>
	Promise.resolve( {
		json: () => Promise.resolve(),
	} )
);

// Don't need to mock specific functions for any tests, but mocking
// module because it accesses the `document` global.
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	canAccessWpcomApis: jest.fn(),
	reloadProxy: jest.fn(),
	requestAllBlogsAccess: jest.fn(),
} ) );

// Mock crypto.randomUUID with its Node.js implementation
global.crypto.randomUUID = () => require( 'crypto' ).randomUUID();

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

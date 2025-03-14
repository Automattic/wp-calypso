import '@testing-library/jest-dom';
// eslint-disable-next-line import/order
const { Request, Response } = require( 'node-fetch' );
const { ReadableStream, TransformStream } = require( 'stream/web' );
// eslint-disable-next-line import/order
const { TextEncoder, TextDecoder } = require( 'util' );

// Define Response for nock 14
global.Request = Request;
global.Response = Response;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

// Define TextEncoder for ReactDOMServer
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
} ) );

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

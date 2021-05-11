/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Internal dependencies
 */
import * as Logger from 'calypso/server/lib/logger';
import { logError } from '../log-error';

jest.mock( 'calypso/server/lib/logger', () => {
	const logger = jest.fn();
	return {
		getLogger: () => ( { error: logger } ),
	};
} );
const mockedLogger = Logger.getLogger().error as jest.MockedFunction< () => unknown >;

function setSsrContext() {
	// @ts-ignore
	globalThis.window = undefined;
}
const mockWindow = {
	FormData: class {
		append( key: string, value: unknown ) {
			this[ key ] = value;
		}
	},
	fetch: jest.fn(),
};
function setBrowserContext() {
	// @ts-ignore
	globalThis.window = mockWindow;
}

beforeEach( () => {
	jest.resetAllMocks();
	setBrowserContext();
} );

describe( 'logError', () => {
	it( 'should log to the server in SSR', () => {
		setSsrContext();
		logError( { message: 'asdf', foo: 'bar' } );
		expect( mockedLogger.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "message": "asdf",
		      "properties": Object {
		        "context": "explat",
		        "explat_client": "calypso",
		        "foo": "bar",
		        "message": "asdf",
		      },
		    },
		  ],
		]
	` );
	} );
	it( 'should log to the server in the browser', () => {
		logError( { message: 'asdf', foo: 'bar' } );
		expect( mockWindow.fetch.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    "https://public-api.wordpress.com/rest/v1.1/js-error",
		    Object {
		      "body": FormData {
		        "error": "{\\"message\\":\\"asdf\\",\\"properties\\":{\\"foo\\":\\"bar\\",\\"context\\":\\"explat\\",\\"explat_client\\":\\"calypso\\",\\"message\\":\\"asdf\\"}}",
		      },
		      "method": "POST",
		    },
		  ],
		]
	` );
	} );
} );

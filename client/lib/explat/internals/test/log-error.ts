// @ts-nocheck - TODO: Fix TypeScript issues
import { vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import * as Logger from 'calypso/server/lib/logger';
import { logError } from '../log-error';

vi.mock( 'calypso/lib/wp' );

vi.mock( 'calypso/server/lib/logger', () => {
	const logger = vi.fn();
	return {
		getLogger: () => ( { error: logger } ),
	};
} );

function setSsrContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	globalThis.window = undefined;
}
const mockWindow = {
	FormData: class {
		append( key: string, value: unknown ) {
			this[ key ] = value;
		}
	},
	fetch: vi.fn(),
};
function setBrowserContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	globalThis.window = mockWindow;
}

beforeEach( () => {
	vi.resetAllMocks();
	setBrowserContext();
} );

describe( 'logError', () => {
	it( 'should log to the server in SSR', () => {
		setSsrContext();
		logError( { message: 'asdf', foo: 'bar' } );
		expect( vi.mocked( Logger.getLogger().error ).mock.calls ).toMatchInlineSnapshot( `
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
		expect( vi.mocked( wpcom.req.post ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "apiNamespace": "rest/v1.1",
		      "body": Object {
		        "error": "{\\"message\\":\\"asdf\\",\\"properties\\":{\\"foo\\":\\"bar\\",\\"context\\":\\"explat\\",\\"explat_client\\":\\"calypso\\",\\"message\\":\\"asdf\\"}}",
		      },
		      "path": "/js-error",
		    },
		    [Function],
		  ],
		]
	` );
	} );
} );

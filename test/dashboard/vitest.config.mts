import path from 'node:path';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

process.env.TZ = 'UTC';

const packages = path.resolve( import.meta.dirname, '../../packages' );

export default calypsoTestConfig( {
	root: path.resolve( import.meta.dirname, '../../client' ),
	resolve: {
		alias: [
			// agenttic-client has no `calypso:src` export, and CI doesn't build it before the tests. A
			// file that fails to import leaves its nock patched onto the worker's `http`, failing the
			// network requests of every later file in that worker.
			{
				find: /^@automattic\/agenttic-client$/,
				replacement: path.join( packages, 'agenttic-client/src/index.ts' ),
			},
		],
	},
	test: {
		include: [ 'dashboard/**/test/*.test.{js,jsx,ts,tsx}' ],
		setupFiles: [ path.join( import.meta.dirname, 'vitest-setup.ts' ) ],
		// nock can schedule the reply to a request after the file's `afterAll` aborted its pending
		// replies. The reply then lands in the torn-down context, where nothing awaits it.
		onUnhandledError: ( error ) =>
			! (
				error.message === 'ReadableStream is not defined' &&
				error.stack?.includes( 'nock/lib/create_response.js' )
			),
	},
} );

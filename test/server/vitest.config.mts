import path from 'node:path';
import { CALYPSO_SRC } from '../../build-tools/vite/base.mjs';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

const root = path.resolve( import.meta.dirname, '../..' );

const config = calypsoTestConfig( {
	resolve: {
		alias: [
			{
				find: /^@automattic\/calypso-config\/(.*)$/,
				replacement: path.join( root, 'client/server/config/$1' ),
			},
		],
	},
	test: {
		root: path.join( root, 'client/server' ),
		include: [ '**/test/*.[jt]s?(x)' ],
		pool: 'forks',
		setupFiles: [ path.join( import.meta.dirname, 'setup-test-framework.js' ) ],
	},
} );

// The server runs on Node, so it resolves packages' Node builds rather than the browser ones the
// client tests use.
config.resolve!.conditions = [ CALYPSO_SRC, 'node', 'development' ];

export default config;

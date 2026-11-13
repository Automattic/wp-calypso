/**
 * Checks for drift between the webpack and Vite configurations: `yarn vite-check`. Webpack builds
 * production and Vite serves `yarn start-dashboard:vite` in development, so code can work with one
 * and not the other. This check is needed for as long as the repo has both bundlers.
 *
 * With the dev server's config, it pre-bundles the dependencies Vite's scanner finds from the
 * entries, then transforms every first-party module reachable from them, and fails on any error.
 * It also fails on webpack-only code that survives Vite's transform and would only break in the
 * browser. Webpack builds keep working either way, so without this check nobody would notice.
 */
import path from 'node:path';
import { createServer, optimizeDeps, resolveConfig } from 'vite';
import { root } from './base.mjs';
import { startDashboardDevConfig, startDashboardEntries } from './dev.mjs';

process.env.CALYPSO_ENV ??= 'dashboard-development';

// Webpack-only code that Vite passes through unchanged.
const LEFTOVERS = [
	[ /\brequire\.context\s*\(/, 'require.context()' ],
	[ /\bmodule\.hot\b/, 'module.hot' ],
	[ /(?<![.\w$])require\s*\(/, 'require() in an ES module' ],
	[ /\bimport\s*\(\s*(?:\/\*[\s\S]*?\*\/\s*)*`[^`]*\$\{/, 'import() of a template literal' ],
	[ /\bprocess\.env(?:\?\.|\.)(?!NODE_ENV\b)\w+/, 'process.env without a define' ],
];

// Files where a leftover is guarded or deliberate, and the reason.
const ALLOWED = {
	'client/components/async-load/index.tsx': '`require` is a prop',
	'client/sections-middleware.js': 'guarded by `typeof module`, for webpack hot reloading',
	'packages/create-calypso-config/src/index.ts': 'guarded by `typeof process`, for the server',
};

const STYLE = /\.(s?css|sass)(\?|$)/;
const ASSET = /\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot|mp4|webm|ico)(\?|$)/;

const config = startDashboardDevConfig();
config.logLevel = 'error';
config.cacheDir = path.join( root, '.cache/vite-check' );
// Let the leftover scan see every `process.env.X`, which the define would otherwise replace.
delete config.define[ 'process.env' ];

const failures = [];
const fail = ( where, message ) => failures.push( `${ where }: ${ message }` );

let started = performance.now();
let optimized = 0;
try {
	const metadata = await optimizeDeps(
		await resolveConfig( config, 'serve', 'development' ),
		true
	);
	optimized = Object.keys( metadata.optimized ).length;
} catch ( error ) {
	fail( '(pre-bundling)', String( error.message ) );
}
const optimizeMs = performance.now() - started;

started = performance.now();
config.optimizeDeps = { ...config.optimizeDeps, noDiscovery: true };
const server = await createServer( config );
const environment = server.environments.client;
const seen = new Set( Object.values( startDashboardEntries ).map( ( file ) => '/' + file ) );
const queue = [ ...seen ];

async function visit( url ) {
	let result;
	try {
		result = await environment.transformRequest( url );
	} catch ( error ) {
		fail( url, String( error.message ).split( '\n' )[ 0 ] );
		return;
	}
	if ( STYLE.test( url ) ) {
		return;
	}
	const file = url.replace( /^\/|\?.*$/g, '' );
	if ( result && ! ALLOWED[ file ] ) {
		for ( const [ pattern, what ] of LEFTOVERS ) {
			const match = result.code.match( pattern );
			if ( match ) {
				fail( url, `${ what }: ${ match[ 0 ] }` );
			}
		}
	}
	const module = await environment.moduleGraph.getModuleByUrl( url );
	for ( const dependency of module?.importedModules ?? [] ) {
		if (
			dependency.file &&
			! dependency.file.includes( '/node_modules/' ) &&
			! dependency.file.startsWith( config.cacheDir ) &&
			! ASSET.test( dependency.url ) &&
			! seen.has( dependency.url )
		) {
			seen.add( dependency.url );
			queue.push( dependency.url );
		}
	}
}

await new Promise( ( resolve ) => {
	let inFlight = 0;
	const pump = () => {
		while ( inFlight < 64 && queue.length ) {
			inFlight++;
			visit( queue.shift() ).finally( () => {
				inFlight--;
				queue.length || inFlight ? pump() : resolve();
			} );
		}
	};
	pump();
} );
await server.close();
const crawlMs = performance.now() - started;

console.log(
	`Pre-bundled ${ optimized } dependencies in ${ Math.round( optimizeMs ) }ms and transformed ${
		seen.size
	} modules in ${ Math.round( crawlMs ) }ms.`
);
if ( failures.length ) {
	console.error( `${ failures.length } problems:\n  ${ failures.sort().join( '\n  ' ) }` );
	process.exitCode = 1;
}

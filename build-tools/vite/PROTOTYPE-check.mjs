// PROTOTYPE (DOTMSD-1675): drift guard candidate. With the dev-server config, (1) pre-bundle the
// deps Vite's scanner finds from the Dashboard entries, then (2) transform every first-party module
// reachable from them. Fails on any error, as CI would. Throwaway.
//
//   node build-tools/vite/PROTOTYPE-check.mjs
import { createServer, optimizeDeps, resolveConfig } from 'vite';
import { dashboardDevConfig, dashboardEntries } from './dev.mjs';

const ASSET = /\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot|mp4|webm|ico)(\?|$)/;
const config = dashboardDevConfig();
config.logLevel = 'error';
// Simulate drift: PROTOTYPE_DROP_ALIAS=logger drops every alias whose pattern mentions "logger".
if ( process.env.PROTOTYPE_DROP_ALIAS ) {
	config.resolve.alias = config.resolve.alias.filter(
		( a ) => ! String( a.find ).includes( process.env.PROTOTYPE_DROP_ALIAS )
	);
}
config.cacheDir = 'tmp/dotmsd-1675/.vite-check';

let t0 = performance.now();
const resolved = await resolveConfig( config, 'serve', 'development' );
let optimized = 0;
const failures = [];
try {
	const meta = await optimizeDeps( resolved, true );
	optimized = Object.keys( meta.optimized ).length;
} catch ( e ) {
	failures.push( { url: '(optimizeDeps)', message: String( e.message ).split( '\n' )[ 0 ] } );
}
const optimizeMs = performance.now() - t0;

t0 = performance.now();
config.optimizeDeps = { ...config.optimizeDeps, noDiscovery: true };
const server = await createServer( config );
const env = server.environments.client;
const seen = new Set( dashboardEntries.map( ( e ) => '/' + e ) );
const queue = [ ...seen ];
let inFlight = 0;

async function visit( url ) {
	try {
		await env.transformRequest( url );
	} catch ( e ) {
		failures.push( { url, message: String( e.message ).split( '\n' )[ 0 ] } );
		return;
	}
	const mod = await env.moduleGraph.getModuleByUrl( url );
	if ( /\.(s?css|sass)(\?|$)/.test( url ) ) {
		return;
	}
	for ( const dep of mod?.importedModules ?? [] ) {
		if ( dep.file && ! dep.file.includes( '/node_modules/' ) && ! ASSET.test( dep.url ) && ! seen.has( dep.url ) ) {
			seen.add( dep.url );
			queue.push( dep.url );
		}
	}
}
await new Promise( ( resolve ) => {
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
const crawlMs = performance.now() - t0;

console.log(
	`optimized ${ optimized } deps in ${ optimizeMs.toFixed( 0 ) }ms; transformed ${ seen.size } modules in ${ crawlMs.toFixed( 0 ) }ms; ${ failures.length } failures`
);
for ( const f of failures.slice( 0, 20 ) ) {
	console.log( `  ${ f.url }: ${ f.message }` );
}
process.exitCode = failures.length ? 1 : 0;

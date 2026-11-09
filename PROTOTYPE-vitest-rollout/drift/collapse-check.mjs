// DOTMSD-1687: detect optimizer collapses from actual first-party import sites.
//
// The dep optimizer keys pre-bundles by bare id, so every first-party importer of `foo` gets one
// install, while webpack (and Node) resolve the nearest install per importer. Crawl the dev
// server's module graph from the entries (as the drift check does), record every bare specifier a
// first-party module imports, resolve each one's package root from its importer the Node way
// (nearest node_modules/<name>, realpath'd), and flag names that reach more than one root.
// Declared-but-unimported deps and Node-only code (client/server) never appear.
//
//   CRAWL=dashboard|all node PROTOTYPE-vitest-rollout/drift/collapse-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { allEntries, dashboardEntries, startDevConfig } from '../../build-tools/vite/dev.mjs';

const root = path.resolve( import.meta.dirname, '../..' );
const rel = ( p ) => path.relative( root, p );
const crawl = process.env.CRAWL ?? 'all';
const entries = crawl === 'dashboard' ? dashboardEntries : allEntries;
const allow = JSON.parse( fs.readFileSync( path.join( import.meta.dirname, 'collapse-allowlist.json' ), 'utf8' ) );
const ASSET = /\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot|mp4|webm|ico)(\?|$)/;
const STYLE = /\.(s?css|sass|less)(\?|$)/;
const BARE = /^(?![./\0]|[a-z]+:|\/)((?:@[^/]+\/)?[^/?]+)/i;

// importer -> Set(spec), for first-party importers only.
const imports = new Map();
const recorder = {
	name: 'record-bare-imports',
	enforce: 'pre',
	resolveId( source, importer ) {
		if ( ! importer || importer.includes( '/node_modules/' ) || importer.startsWith( '\0' ) ) {
			return;
		}
		if ( BARE.test( source ) && ! STYLE.test( source ) && ! ASSET.test( source ) ) {
			const file = importer.split( '?' )[ 0 ];
			( imports.get( file ) ?? imports.set( file, new Set() ).get( file ) ).add( source );
		}
	},
};

const t0 = performance.now();
const config = startDevConfig( { isSectionEnabled: () => crawl === 'all' } );
config.logLevel = 'error';
config.cacheDir = path.join( import.meta.dirname, '.vite-collapse' );
// Only first-party modules are transformed; nothing needs pre-bundling.
config.optimizeDeps = { ...config.optimizeDeps, noDiscovery: true, include: [] };
config.plugins.unshift( recorder );
const server = await createServer( config );
const env = server.environments.client;
const seen = new Set( entries.map( ( e ) => '/' + e ) );
const queue = [ ...seen ];
const errors = [];
let inFlight = 0;
async function visit( url ) {
	try {
		await env.transformRequest( url );
	} catch ( e ) {
		errors.push( `${ url }: ${ String( e.message ).split( '\n' )[ 0 ] }` );
		return;
	}
	if ( STYLE.test( url ) ) {
		return;
	}
	const mod = await env.moduleGraph.getModuleByUrl( url );
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
const excluded = new Set( [ ...( config.optimizeDeps.exclude ?? [] ), ...( config.resolve.dedupe ?? [] ) ] );
await server.close();
const crawlMs = performance.now() - t0;

// ---- group by package name, nearest install per importer ----
const t1 = performance.now();
const memo = new Map();
function installRoot( name, fromDir ) {
	const key = `${ fromDir }\0${ name }`;
	if ( memo.has( key ) ) {
		return memo.get( key );
	}
	let found = null;
	for ( let d = fromDir; ; d = path.dirname( d ) ) {
		const pkg = path.join( d, 'node_modules', name, 'package.json' );
		if ( fs.existsSync( pkg ) ) {
			found = path.dirname( fs.realpathSync( pkg ) );
			break;
		}
		if ( d === path.dirname( d ) ) {
			break;
		}
	}
	memo.set( key, found );
	return found;
}
const byName = new Map(); // name -> Map(root -> Set(importer))
let edges = 0;
for ( const [ importer, specs ] of imports ) {
	for ( const spec of specs ) {
		const name = spec.match( BARE )[ 1 ];
		if ( excluded.has( name ) ) {
			continue;
		}
		const dir = installRoot( name, path.dirname( importer ) );
		// Unresolvable (aliases, virtual ids, builtins) or a linked workspace package served as source.
		if ( ! dir || ! dir.includes( '/node_modules/' ) ) {
			continue;
		}
		edges++;
		const roots = byName.get( name ) ?? byName.set( name, new Map() ).get( name );
		( roots.get( dir ) ?? roots.set( dir, new Set() ).get( dir ) ).add( importer );
	}
}
const version = ( d ) => JSON.parse( fs.readFileSync( path.join( d, 'package.json' ), 'utf8' ) ).version;
const failures = [];
for ( const [ name, roots ] of [ ...byName ].sort() ) {
	if ( roots.size < 2 ) {
		continue;
	}
	const lines = [ ...roots ].map( ( [ dir, importers ] ) => {
		const list = [ ...importers ].map( rel ).sort();
		return `    ${ rel( dir ) }@${ version( dir ) } (${ list.length }): ${ list.slice( 0, 3 ).join( ', ' ) }${ list.length > 3 ? ', …' : '' }`;
	} );
	const versions = new Set( [ ...roots.keys() ].map( version ) );
	const msg = `[collapse] ${ name } reaches ${ roots.size } installs:\n${ lines.join( '\n' ) }`;
	if ( allow[ name ] ) {
		console.log( `[allowed] ${ name }: ${ allow[ name ] }` );
	} else if ( versions.size === 1 ) {
		// Same version twice: one instance under Vite, two under webpack. Harmless; `yarn dedupe` fixes it.
		console.log( msg.replace( '[collapse]', '[note: same version]' ) );
	} else {
		failures.push( msg );
	}
}
const groupMs = performance.now() - t1;
console.log(
	`crawl=${ crawl }: ${ seen.size } modules transformed, ${ imports.size } first-party importers, ${ edges } bare edges to ${ byName.size } packages; ${ failures.length } collapses; ${ errors.length } transform errors`
);
console.log( `time: crawl ${ crawlMs.toFixed( 0 ) }ms, group ${ groupMs.toFixed( 0 ) }ms` );
for ( const f of failures ) {
	console.log( f );
}
for ( const e of errors.slice( 0, 5 ) ) {
	console.log( `  transform error: ${ e }` );
}
process.exitCode = failures.length ? 1 : 0;

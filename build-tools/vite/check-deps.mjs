/**
 * The dependency checks of `yarn vite-check`: where Vite resolves a dependency that first-party code
 * imports differently from webpack.
 */
import fs from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import path from 'node:path';
import { createIdResolver } from 'vite';
import { client, root } from './base.mjs';

const require = createRequire( import.meta.url );

const BARE = /^(?![./\0]|[a-z]+:|\/)((?:@[^/]+\/)?[^/?]+)/i;
const STYLE = /\.(s?css|sass|less)(\?|$)/;
const ASSET = /\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot|mp4|webm|ico)(\?|$)/;
// Node built-ins and `browser: false` map to an empty module in both bundlers.
const EMPTY = '(empty)';

const relative = ( file ) => path.relative( root, file );

/** The package a file belongs to and its path inside it, e.g. `moment/dist/moment.js`. */
function packagePath( file ) {
	const index = file.lastIndexOf( '/node_modules/' );
	return index === -1 ? relative( file ) : file.slice( index + '/node_modules/'.length );
}

function packageRoot( file ) {
	const match = file.match( /^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\// );
	return match ? match[ 1 ] : null;
}

/**
 * Records the bare specifiers first-party modules import, by importer.
 * @param {Map<string, Set<string>>} imports
 * @returns {import('vite').Plugin}
 */
export function recordBareImports( imports ) {
	return {
		name: 'calypso-check-record-bare-imports',
		enforce: 'pre',
		resolveId( source, importer ) {
			if (
				! importer ||
				importer.startsWith( '\0' ) ||
				importer.includes( '/node_modules/' ) ||
				! BARE.test( source ) ||
				source.startsWith( 'calypso/' ) ||
				STYLE.test( source ) ||
				ASSET.test( source )
			) {
				return;
			}
			const file = importer.split( '?' )[ 0 ];
			if ( ! imports.has( file ) ) {
				imports.set( file, new Set() );
			}
			imports.get( file ).add( source );
		},
	};
}

/**
 * Vite's dep optimizer keeps one install of each package name, so every first-party importer gets
 * the same one. Webpack resolves the nearest install for each importer. Fails when first-party code
 * reaches installs with different versions of one package.
 * @param {Map<string, Set<string>>} imports    Bare specifiers by importer.
 * @param {Record<string, string>}   allowed    Package names, with the reason.
 * @returns {{ failures: string[], notes: string[] }}
 */
export function checkCollapses( imports, allowed ) {
	const installs = new Map();
	const memo = new Map();
	const nearestInstall = ( name, dir ) => {
		const key = `${ dir }\0${ name }`;
		if ( ! memo.has( key ) ) {
			const file = path.join( dir, 'node_modules', name, 'package.json' );
			let found = null;
			if ( fs.existsSync( file ) ) {
				found = path.dirname( fs.realpathSync( file ) );
			} else if ( dir !== path.dirname( dir ) ) {
				found = nearestInstall( name, path.dirname( dir ) );
			}
			memo.set( key, found );
		}
		return memo.get( key );
	};
	for ( const [ importer, specifiers ] of imports ) {
		for ( const specifier of specifiers ) {
			const name = specifier.match( BARE )[ 1 ];
			const dir = nearestInstall( name, path.dirname( importer ) );
			// Workspace packages are served from source, not pre-bundled.
			if ( ! dir?.includes( '/node_modules/' ) ) {
				continue;
			}
			if ( ! installs.has( name ) ) {
				installs.set( name, new Map() );
			}
			const importers = installs.get( name );
			importers.set( dir, ( importers.get( dir ) ?? new Set() ).add( importer ) );
		}
	}

	const failures = [];
	const notes = [];
	const version = ( dir ) =>
		JSON.parse( fs.readFileSync( path.join( dir, 'package.json' ), 'utf8' ) ).version;
	for ( const [ name, importers ] of installs ) {
		if ( importers.size < 2 || allowed[ name ] ) {
			continue;
		}
		const list = [ ...importers ].map( ( [ dir, files ] ) => {
			const sample = [ ...files ].map( relative ).sort();
			return `${ relative( dir ) }@${ version( dir ) } (${ sample[ 0 ] }${
				sample.length > 1 ? ` and ${ sample.length - 1 } more` : ''
			})`;
		} );
		const message = `${ name }: first-party code imports ${ list.join( ', ' ) }`;
		if ( new Set( [ ...importers.keys() ].map( version ) ).size > 1 ) {
			failures.push( message );
		} else {
			notes.push( message );
		}
	}
	return { failures, notes };
}

function webpackResolver() {
	const webpack = require( 'webpack' );
	const config = require( path.join( client, 'webpack.config.js' ) );
	// Only the resolve options matter, and some plugins do work on construction.
	const compiler = webpack( { ...config, plugins: [] } );
	const instance = compiler.resolverFactory.get( 'normal', {
		dependencyType: 'esm',
		fullySpecified: false,
	} );
	return ( specifier, dir ) =>
		new Promise( ( resolve ) => {
			// Like `NormalModuleReplacementPlugin( /^path$/, 'path-browserify' )`.
			const request = specifier === 'path' ? 'path-browserify' : specifier;
			instance.resolve( {}, dir, request, {}, ( error, result ) => {
				if ( result === false || ( error && isBuiltin( specifier ) ) ) {
					resolve( EMPTY );
				} else {
					resolve( error ? null : result.split( '?' )[ 0 ] );
				}
			} );
		} );
}

function viteResolver( resolvedConfig, environment ) {
	const resolve = createIdResolver( resolvedConfig, { asSrc: false, scan: true } );
	return async ( specifier, importer ) => {
		const id = await resolve( environment, specifier, importer );
		if ( id === undefined ) {
			return isBuiltin( specifier ) ? EMPTY : null;
		}
		if ( id.startsWith( '\0' ) || id.includes( '__vite-browser-external' ) ) {
			return EMPTY;
		}
		return id.split( '?' )[ 0 ];
	};
}

const realpath = ( file ) => ( file && file !== EMPTY ? fs.realpathSync( file ) : file );

/**
 * Resolves every bare import of first-party code with both Vite's optimizer resolver and webpack's, and fails on each difference
 * that isn't allowed. Also fails when one file under webpack becomes two under Vite.
 * @param {Object} options
 * @param {import('vite').ResolvedConfig} options.resolvedConfig
 * @param {import('vite').DevEnvironment} options.environment
 * @param {Map<string, Set<string>>}       options.imports   First-party bare specifiers by importer.
 * @param {{ files: Record<string, string>, duplicates: Record<string, string> }} options.allowed
 * @returns {Promise<{ failures: string[], edges: number }>}
 */
export async function checkResolution( { resolvedConfig, environment, imports, allowed } ) {
	const edges = [];
	for ( const [ importer, specifiers ] of imports ) {
		for ( const specifier of specifiers ) {
			edges.push( { importer, specifier } );
		}
	}

	const vite = viteResolver( resolvedConfig, environment );
	const webpack = webpackResolver();
	const packageDirs = new Map();
	const packageDirOf = ( dir ) => {
		if ( ! packageDirs.has( dir ) ) {
			const parent = path.dirname( dir );
			packageDirs.set(
				dir,
				fs.existsSync( path.join( dir, 'package.json' ) ) || parent === dir
					? dir
					: packageDirOf( parent )
			);
		}
		return packageDirs.get( dir );
	};
	const results = new Map();
	const differences = new Map();
	const viteFilesByWebpackFile = new Map();
	await Promise.all(
		edges.map( async ( { importer, specifier } ) => {
			// A bare specifier resolves the same from anywhere in a package.
			const dir = path.dirname( importer );
			const key = `${ BARE.test( specifier ) ? packageDirOf( dir ) : dir }\0${ specifier }`;
			if ( ! results.has( key ) ) {
				results.set(
					key,
					Promise.all( [
						vite( specifier, importer ).then( realpath ),
						webpack( specifier, dir ).then( realpath ),
					] ).catch( () => [ null, null ] )
				);
			}
			const [ viteFile, webpackFile ] = await results.get( key );
			if ( viteFile && webpackFile && viteFile !== EMPTY && webpackFile !== EMPTY ) {
				if ( ! viteFilesByWebpackFile.has( webpackFile ) ) {
					viteFilesByWebpackFile.set( webpackFile, new Set() );
				}
				viteFilesByWebpackFile.get( webpackFile ).add( viteFile );
			}
			if ( viteFile === webpackFile ) {
				return;
			}
			const pair = `${ viteFile && packagePath( viteFile ) } | ${
				webpackFile && packagePath( webpackFile )
			}`;
			const sameInstall =
				viteFile && webpackFile && packageRoot( viteFile ) === packageRoot( webpackFile );
			if ( sameInstall && allowed.files[ pair ] ) {
				return;
			}
			if ( ! differences.has( pair ) ) {
				differences.set( pair, { specifier, importers: new Set() } );
			}
			differences.get( pair ).importers.add( packagePath( importer ) );
		} )
	);

	const failures = [];
	for ( const [ pair, { specifier, importers } ] of differences ) {
		const [ first ] = [ ...importers ].sort();
		failures.push(
			`${ pair }: Vite resolves the first and webpack the second for \`${ specifier }\` (from ${ first }${
				importers.size > 1 ? ` and ${ importers.size - 1 } more` : ''
			})`
		);
	}
	for ( const [ webpackFile, viteFiles ] of viteFilesByWebpackFile ) {
		const name = packagePath( webpackFile );
		if ( viteFiles.size > 1 && ! allowed.duplicates[ name ] ) {
			failures.push(
				`${ name }: one module under webpack, ${ viteFiles.size } under Vite (${ [ ...viteFiles ]
					.map( packagePath )
					.join( ', ' ) })`
			);
		}
	}
	return { failures, edges: edges.length };
}

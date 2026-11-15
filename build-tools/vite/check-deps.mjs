/**
 * The dependency checks of `yarn vite-check`: where Vite resolves or evaluates a dependency
 * differently from webpack.
 */
import fs from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import path from 'node:path';
import { createIdResolver, parseSync, Visitor } from 'vite';
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

/**
 * The source files of the pre-bundled dependencies, from the optimizer's source maps.
 * @param {string} depsDir
 * @returns {string[]}
 */
function preBundledFiles( depsDir ) {
	const files = new Set();
	for ( const name of fs.readdirSync( depsDir ) ) {
		if ( ! name.endsWith( '.js.map' ) ) {
			continue;
		}
		// The `sources` list comes before the much bigger `sourcesContent`.
		const map = fs.readFileSync( path.join( depsDir, name ), 'utf8' );
		const sources = map.match( /"sources":(\[[^\]]*\])/ );
		for ( const source of JSON.parse( sources?.[ 1 ] ?? '[]' ) ) {
			const file = path.resolve( depsDir, source );
			if (
				! source.startsWith( '\0' ) &&
				/\.[cm]?[jt]sx?$/.test( file ) &&
				fs.existsSync( file )
			) {
				files.add( file );
			}
		}
	}
	return [ ...files ];
}

/** The string specifiers a file imports, exports from, `import()`s and `require()`s. */
function specifiersOf( file ) {
	const specifiers = [];
	const code = fs.readFileSync( file, 'utf8' );
	const result = parseSync( file, code );
	if ( result.errors.length ) {
		return specifiers;
	}
	const { staticImports, staticExports, dynamicImports } = result.module;
	for ( const { moduleRequest } of staticImports ) {
		specifiers.push( { specifier: moduleRequest.value, kind: 'import' } );
	}
	for ( const { entries } of staticExports ) {
		for ( const { moduleRequest } of entries ) {
			if ( moduleRequest ) {
				specifiers.push( { specifier: moduleRequest.value, kind: 'import' } );
			}
		}
	}
	for ( const { moduleRequest } of dynamicImports ) {
		const literal = code.slice( moduleRequest.start, moduleRequest.end ).match( /^(['"])(.*)\1$/ );
		if ( literal ) {
			specifiers.push( { specifier: literal[ 2 ], kind: 'import' } );
		}
	}
	// Building the AST is the slow part, so only do it when there may be a `require()`.
	if ( /\brequire\s*\(/.test( code ) ) {
		new Visitor( {
			CallExpression( node ) {
				const [ argument ] = node.arguments;
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require' &&
					node.arguments.length === 1 &&
					typeof argument.value === 'string'
				) {
					specifiers.push( { specifier: argument.value, kind: 'require' } );
				}
			},
		} ).visit( result.program );
	}
	return specifiers;
}

function webpackResolvers() {
	const webpack = require( 'webpack' );
	const config = require( path.join( client, 'webpack.config.js' ) );
	// Only the resolve options matter, and some plugins do work on construction.
	const compiler = webpack( { ...config, plugins: [] } );
	const resolver = ( dependencyType ) => {
		const instance = compiler.resolverFactory.get( 'normal', {
			dependencyType,
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
	};
	return { import: resolver( 'esm' ), require: resolver( 'commonjs' ) };
}

function viteResolvers( resolvedConfig, environment ) {
	const resolver = ( options ) => {
		const resolve = createIdResolver( resolvedConfig, { asSrc: false, scan: true, ...options } );
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
	};
	return { import: resolver( {} ), require: resolver( { isRequire: true } ) };
}

const realpath = ( file ) => ( file && file !== EMPTY ? fs.realpathSync( file ) : file );

/**
 * Resolves every bare import of first-party code, and every import inside the pre-bundled
 * dependencies, with both Vite's optimizer resolver and webpack's, and fails on each difference
 * that isn't allowed. Also fails when one file under webpack becomes two under Vite.
 * @param {Object} options
 * @param {import('vite').ResolvedConfig} options.resolvedConfig
 * @param {import('vite').DevEnvironment} options.environment
 * @param {string}                         options.depsDir   The optimizer's output folder.
 * @param {Map<string, Set<string>>}       options.imports   First-party bare specifiers by importer.
 * @param {{ files: Record<string, string>, duplicates: Record<string, string> }} options.allowed
 * @returns {Promise<{ failures: string[], edges: number }>}
 */
export async function checkResolution( {
	resolvedConfig,
	environment,
	depsDir,
	imports,
	allowed,
} ) {
	const edges = [];
	for ( const [ importer, specifiers ] of imports ) {
		for ( const specifier of specifiers ) {
			edges.push( { importer, specifier, kind: 'import' } );
		}
	}
	for ( const file of preBundledFiles( depsDir ) ) {
		for ( const { specifier, kind } of specifiersOf( file ) ) {
			edges.push( { importer: file, specifier, kind } );
		}
	}

	const vite = viteResolvers( resolvedConfig, environment );
	const webpack = webpackResolvers();
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
		edges.map( async ( { importer, specifier, kind } ) => {
			// A bare specifier resolves the same from anywhere in a package.
			const dir = path.dirname( importer );
			const key = `${ kind }\0${ BARE.test( specifier ) ? packageDirOf( dir ) : dir }\0${ specifier }`;
			if ( ! results.has( key ) ) {
				results.set(
					key,
					Promise.all( [
						vite[ kind ]( specifier, importer ).then( realpath ),
						webpack[ kind ]( specifier, dir ).then( realpath ),
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
				differences.set( pair, { specifier, kind, importers: new Set() } );
			}
			differences.get( pair ).importers.add( packagePath( importer ) );
		} )
	);

	const failures = [];
	for ( const [ pair, { specifier, kind, importers } ] of differences ) {
		const [ first ] = [ ...importers ].sort();
		failures.push(
			`${ pair }: Vite resolves the first and webpack the second for \`${ specifier }\` (${ kind } from ${ first }${
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

/**
 * Pre-bundled CommonJS runs as an ES module, which is always strict, while webpack keeps it
 * sloppy. Fails on each assignment to an undeclared variable (a `ReferenceError` under Vite, a
 * leaked global under webpack), each free `global` (webpack defines it as `window`) and each direct
 * `eval()` (strict under Vite) in the optimizer's output, mapped back to the source file.
 * @param {string}                 depsDir
 * @param {Record<string, string>} allowed  `<package path>: <name>`, with the reason.
 * @returns {string[]}
 */
export function checkStrictMode( depsDir, allowed ) {
	const { analyze } = require( 'eslint-scope' );
	const { TraceMap, originalPositionFor } = require( '@jridgewell/trace-mapping' );
	const failures = new Set();
	for ( const name of fs.readdirSync( depsDir ) ) {
		if ( ! name.endsWith( '.js' ) ) {
			continue;
		}
		const file = path.join( depsDir, name );
		const code = fs.readFileSync( file, 'utf8' );
		if ( ! /\b__commonJS|\bglobal\b/.test( code ) ) {
			continue;
		}
		const { program, errors } = parseSync( file, code, { sourceType: 'module', range: true } );
		if ( errors.length ) {
			failures.add( `${ name }: doesn't parse as an ES module: ${ errors[ 0 ].message }` );
			continue;
		}
		const findings = [];
		const typeofOperands = new Set();
		new Visitor( {
			UnaryExpression( node ) {
				if ( node.operator === 'typeof' ) {
					typeofOperands.add( node.argument );
				}
			},
			CallExpression( node ) {
				if ( node.callee.type === 'Identifier' && node.callee.name === 'eval' ) {
					findings.push( { identifier: node.callee, what: 'direct eval' } );
				}
			},
		} ).visit( program );
		// A direct `eval()` would otherwise leave every enclosing variable unresolved.
		const scope = analyze( program, {
			ecmaVersion: 2026,
			sourceType: 'module',
			ignoreEval: true,
		} ).globalScope;
		for ( const reference of scope.through ) {
			const { identifier } = reference;
			if ( reference.isWrite() ) {
				findings.push( { identifier, what: `assigns undeclared ${ identifier.name }` } );
			} else if ( identifier.name === 'global' && ! typeofOperands.has( identifier ) ) {
				findings.push( { identifier, what: 'free global' } );
			}
		}
		if ( ! findings.length ) {
			continue;
		}
		const map = new TraceMap( fs.readFileSync( file + '.map', 'utf8' ) );
		const lineStarts = [ 0 ];
		for ( let i = code.indexOf( '\n' ); i !== -1; i = code.indexOf( '\n', i + 1 ) ) {
			lineStarts.push( i + 1 );
		}
		for ( const { identifier, what } of findings ) {
			let line = lineStarts.findLastIndex( ( start ) => start <= identifier.start );
			const original = originalPositionFor( map, {
				line: line + 1,
				column: identifier.start - lineStarts[ line ],
			} );
			const source = original.source
				? packagePath( path.resolve( depsDir, original.source ) )
				: `${ name } (no source)`;
			line = original.line ?? line + 1;
			const key = `${ source }: ${ what }`;
			if ( ! allowed[ key ] ) {
				failures.add( `${ key } (line ${ line })` );
			}
		}
	}
	return [ ...failures ].sort();
}

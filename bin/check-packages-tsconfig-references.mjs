#!/usr/bin/env node

// Checks the project references that `tsc --build` follows to order the package builds:
//
// - `yarn install` builds the workspace packages with `tsc --build packages/tsconfig.json`,
//   so a package whose types live in `dist/` only gets them if that file references it,
//   directly or through another package. Without the reference, a fresh checkout fails
//   `yarn typecheck-client` with "Cannot find module" as soon as something imports the package.
// - A package that imports another tsc-built package must reference it, or a cold
//   `tsc --build` can build the importer before the dependency's `dist/` types exist and
//   fail with "Cannot find module". TS 6 and 7.0 only do that when the build order is
//   unlucky; TS 7.1 always does.
//
// Configs come from `tsc --showConfig`, so `extends`, `include` and `exclude` resolve
// exactly as the build sees them, whichever TypeScript version the repo runs.

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { parseSync, Visitor } from 'oxc-parser';

const ROOT = path.resolve( import.meta.dirname, '..' );
const PACKAGES_DIR = path.join( ROOT, 'packages' );
const ROOT_TSCONFIG = path.join( PACKAGES_DIR, 'tsconfig.json' );
const TSC = path.join( ROOT, 'node_modules', '.bin', 'tsc' );
const SOURCE_FILE = /\.[cm]?[jt]sx?$/;
const AUTOMATTIC_PACKAGE = /^@automattic\/[^/]+/;

const run = promisify( execFile );
const relative = ( file ) => path.relative( ROOT, file );

function fail( message ) {
	console.error( message );
	process.exit( 1 );
}

const configs = new Map();

// The parts of `tsc --showConfig`'s output this script uses, with paths made absolute.
function showConfig( file ) {
	if ( ! configs.has( file ) ) {
		configs.set(
			file,
			run( TSC, [ '--showConfig', '--project', file ], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 } )
				.catch( ( { stdout, stderr } ) =>
					fail(
						`\`tsc --showConfig --project ${ relative( file ) }\` failed:\n${ stdout }${ stderr }`
					)
				)
				.then( ( { stdout } ) => {
					const config = JSON.parse( stdout );
					const dir = path.dirname( file );
					return {
						emits: ! config.compilerOptions?.noEmit,
						aliases: Object.keys( config.compilerOptions?.paths ?? {} ).map( ( pattern ) =>
							pattern.split( '*' )
						),
						files: ( config.files ?? [] ).map( ( name ) => path.resolve( dir, name ) ),
						references: ( config.references ?? [] ).map( ( { path: reference } ) => {
							const target = path.resolve( dir, reference );
							const referenced = target.endsWith( '.json' )
								? target
								: path.join( target, 'tsconfig.json' );
							if ( ! fs.existsSync( referenced ) ) {
								// `tsc --build` fails on this too, so `yarn install` would stop here.
								fail(
									`${ relative( file ) } references "${ reference }", which does not exist. ` +
										'Remove the reference or restore the package.'
								);
							}
							return referenced;
						} ),
					};
				} )
		);
	}
	return configs.get( file );
}

async function collectReferencedConfigs( file, seen = new Set() ) {
	if ( ! seen.has( file ) ) {
		seen.add( file );
		const { references } = await showConfig( file );
		await Promise.all(
			references.map( ( reference ) => collectReferencedConfigs( reference, seen ) )
		);
	}
	return seen;
}

function packageOf( file ) {
	const [ name, ...rest ] = path.relative( PACKAGES_DIR, file ).split( path.sep );
	return rest.length && ! name.startsWith( '..' ) ? name : null;
}

// `paths` patterns have at most one `*`, so each splits into a prefix and an optional suffix.
const isAliased = ( specifier, aliases ) =>
	aliases.some( ( [ prefix, suffix ] ) =>
		suffix === undefined
			? specifier === prefix
			: specifier.length >= prefix.length + suffix.length &&
				specifier.startsWith( prefix ) &&
				specifier.endsWith( suffix )
	);

function hasBuiltTypes( { types, typings, exports: packageExports } ) {
	const entries = [ types, typings ];
	if ( packageExports && typeof packageExports === 'object' ) {
		entries.push( ...Object.values( packageExports ).map( ( entry ) => entry?.types ) );
	}
	return entries.some(
		( entry ) => typeof entry === 'string' && /^(\.\/)?dist(\/|$)/.test( entry )
	);
}

const stringValue = ( node ) =>
	node?.type === 'Literal' && typeof node.value === 'string' ? node.value : null;

// Every module specifier the file imports, including type-only imports, re-exports,
// `import()` (in code and in types) and CommonJS `require()`. Comments don't count.
function importedSpecifiers( file ) {
	const source = fs.readFileSync( file, 'utf8' );
	if ( ! source.includes( '@automattic/' ) ) {
		return [];
	}
	const { module, program } = parseSync( file, source );
	const specifiers = [
		...module.staticImports.map( ( { moduleRequest } ) => moduleRequest.value ),
		...module.staticExports.flatMap( ( { entries } ) =>
			entries.map( ( { moduleRequest } ) => moduleRequest?.value )
		),
	];
	if ( /\b(require|import)\s*\(/.test( source ) ) {
		new Visitor( {
			CallExpression( { callee, arguments: [ argument ] } ) {
				if ( callee.type === 'Identifier' && callee.name === 'require' ) {
					specifiers.push( stringValue( argument ) );
				}
			},
			ImportExpression( { source: specifier } ) {
				specifiers.push( stringValue( specifier ) );
			},
			TSImportType( { source: specifier } ) {
				specifiers.push( stringValue( specifier ) );
			},
		} ).visit( program );
	}
	return specifiers;
}

const packageEntries = fs
	.readdirSync( PACKAGES_DIR )
	.filter(
		( name ) =>
			fs.existsSync( path.join( PACKAGES_DIR, name, 'package.json' ) ) &&
			fs.existsSync( path.join( PACKAGES_DIR, name, 'tsconfig.json' ) )
	)
	.map( async ( name ) => {
		const tsconfig = path.join( PACKAGES_DIR, name, 'tsconfig.json' );
		return {
			name,
			manifest: JSON.parse(
				fs.readFileSync( path.join( PACKAGES_DIR, name, 'package.json' ), 'utf8' )
			),
			tsconfig,
			config: await showConfig( tsconfig ),
		};
	} );

const [ referencedFromRoot, ...packages ] = await Promise.all( [
	collectReferencedConfigs( ROOT_TSCONFIG ),
	...packageEntries,
] );

let failed = false;

const referencedPackages = new Set( [ ...referencedFromRoot ].map( packageOf ) );
const unreferenced = packages.filter(
	( { name, manifest } ) => ! referencedPackages.has( name ) && hasBuiltTypes( manifest )
);
if ( unreferenced.length ) {
	failed = true;
	console.error(
		'These packages publish their types from dist/ but packages/tsconfig.json does not reference them, ' +
			'so the `tsc --build` that `yarn install` runs skips them and a fresh checkout can fail to type-check code that imports them:\n'
	);
	for ( const { name } of unreferenced ) {
		console.error( `  { "path": "./${ name }" },` );
	}
	console.error( '\nAdd the lines above to "references" in packages/tsconfig.json.\n' );
}

const emittingPackages = new Map(
	packages
		.filter( ( { config } ) => config.emits )
		.map( ( { name, manifest } ) => [ manifest.name, name ] )
);

for ( const { name, tsconfig, config } of packages ) {
	const references = new Set( config.references.map( packageOf ) );
	const missing = new Set();
	for ( const file of config.files.filter( ( source ) => SOURCE_FILE.test( source ) ) ) {
		for ( const specifier of importedSpecifiers( file ) ) {
			// An import that `paths` maps elsewhere, such as to the dependency's sources, doesn't read its build.
			if ( ! specifier || isAliased( specifier, config.aliases ) ) {
				continue;
			}
			const dependency = emittingPackages.get( specifier.match( AUTOMATTIC_PACKAGE )?.[ 0 ] );
			if ( dependency && dependency !== name && ! references.has( dependency ) ) {
				missing.add( dependency );
			}
		}
	}
	if ( missing.size ) {
		failed = true;
		console.error(
			`${ relative( tsconfig ) } imports these tsc-built packages without referencing them, ` +
				'so a cold `tsc --build` can build it before their types exist. Add them to its "references":\n'
		);
		for ( const dependency of [ ...missing ].sort() ) {
			console.error( `  { "path": "../${ dependency }" },` );
		}
		console.error();
	}
}

if ( failed ) {
	process.exit( 1 );
}

console.log(
	'packages/tsconfig.json references every package that builds its types, ' +
		'and every package references the tsc-built packages it imports.'
);

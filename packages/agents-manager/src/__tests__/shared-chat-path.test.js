/**
 * @jest-environment node
 */
// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const SOURCE_DIRECTORY = path.join( __dirname, '..' );
// A superset of every entry, so a leak found here may not reach `reader-chat`.
const PACKAGE_INDEX = path.join( SOURCE_DIRECTORY, 'index.ts' );
const SELF_IMPORT_PREFIX = '@automattic/agents-manager/src/';
// Code extensions in webpack's resolve order, so the walk reaches the file the build bundles.
const CODE_EXTENSIONS = [ '.js', '.jsx', '.ts', '.tsx' ];

// `abilities` is bundled, so a leak adds bytes to every entry.
const EDITOR_PACKAGES = [
	'@wordpress/block-editor',
	'@wordpress/blocks',
	'@wordpress/core-data',
	'@wordpress/media-utils',
	'@wordpress/abilities',
];

// The renderer's main entry carries A2UI, and its stylesheet loads with it; only its
// `capabilities` entry is light.
const RENDERER_ENTRY = '@automattic/ai-ui-renderer';
const RENDERER_STYLES = `${ RENDERER_ENTRY }/style.scss`;

const isLazyOnly = ( specifier ) =>
	specifier === RENDERER_ENTRY ||
	specifier === RENDERER_STYLES ||
	EDITOR_PACKAGES.some( ( name ) => specifier === name || specifier.startsWith( `${ name }/` ) );

const isLocalImport = ( specifier ) =>
	specifier.startsWith( '.' ) || specifier.startsWith( SELF_IMPORT_PREFIX );

const isFile = ( file ) => fs.statSync( file, { throwIfNoEntry: false } )?.isFile() ?? false;

const toSourceRelativePath = ( file ) => path.relative( SOURCE_DIRECTORY, file );

function resolveLocalImport( fromFile, specifier ) {
	const base = specifier.startsWith( SELF_IMPORT_PREFIX )
		? path.join( SOURCE_DIRECTORY, specifier.slice( SELF_IMPORT_PREFIX.length ) )
		: path.resolve( path.dirname( fromFile ), specifier );

	return [
		base,
		...CODE_EXTENSIONS.map( ( extension ) => base + extension ),
		...CODE_EXTENSIONS.map( ( extension ) => path.join( base, `index${ extension }` ) ),
	].find( isFile );
}

// An empty clause (`import {} from 'x'`) still loads the module.
const areAllTypeOnly = ( elements ) =>
	elements.length > 0 && elements.every( ( element ) => element.isTypeOnly );

function isTypeOnlyDeclaration( statement ) {
	if ( ts.isExportDeclaration( statement ) ) {
		const clause = statement.exportClause;

		return (
			statement.isTypeOnly ||
			( !! clause && ts.isNamedExports( clause ) && areAllTypeOnly( clause.elements ) )
		);
	}

	const clause = statement.importClause;
	if ( ! clause ) {
		return false;
	}

	const bindings = clause.namedBindings;

	return (
		clause.isTypeOnly ||
		( ! clause.name &&
			!! bindings &&
			ts.isNamedImports( bindings ) &&
			areAllTypeOnly( bindings.elements ) )
	);
}

// Top-level statements only, so `import()` and `typeof import()` are skipped.
function getValueImports( file ) {
	const source = ts.createSourceFile(
		file,
		fs.readFileSync( file, 'utf8' ),
		ts.ScriptTarget.Latest
	);

	return source.statements
		.filter(
			( statement ) =>
				( ts.isImportDeclaration( statement ) || ts.isExportDeclaration( statement ) ) &&
				statement.moduleSpecifier &&
				! isTypeOnlyDeclaration( statement )
		)
		.map( ( statement ) => statement.moduleSpecifier.text );
}

function findLazyImportChains() {
	// Maps each reached file to its import chain from `index.ts`. Adding while iterating
	// walks breadth first, so each chain is a shortest one.
	const chains = new Map( [ [ PACKAGE_INDEX, [ toSourceRelativePath( PACKAGE_INDEX ) ] ] ] );
	const leaks = [];

	for ( const [ file, chain ] of chains ) {
		for ( const specifier of getValueImports( file ) ) {
			if ( isLazyOnly( specifier ) ) {
				leaks.push( [ ...chain, specifier ].join( ' → ' ) );
				continue;
			}

			if ( ! isLocalImport( specifier ) ) {
				continue;
			}

			const resolved = resolveLocalImport( file, specifier );
			if ( ! resolved ) {
				throw new Error(
					`Can’t resolve '${ specifier }' imported by ${ toSourceRelativePath( file ) }.`
				);
			}

			if ( CODE_EXTENSIONS.includes( path.extname( resolved ) ) && ! chains.has( resolved ) ) {
				chains.set( resolved, [ ...chain, toSourceRelativePath( resolved ) ] );
			}
		}
	}

	return leaks;
}

// A failure lists each import chain. Read editor stores by name, drop the import, or use
// `import type`; see "No static editor imports" under Performance in AGENTS.md. Take renderer
// values from its `capabilities` entry instead.
describe( 'shared chat path', () => {
	it( 'imports editor packages and the interactive UI renderer only through `import()` or `import type`', () => {
		expect( findLazyImportChains() ).toEqual( [] );
	} );
} );

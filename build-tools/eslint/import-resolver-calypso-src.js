const path = require( 'path' );
const typescriptResolver = require( 'eslint-import-resolver-typescript' );

const repoRoot = path.resolve( __dirname, '../..' );

// Resolves workspace packages to their `calypso:src` entry, like webpack and Jest do, so
// import rules check package source and don't depend on `yarn build-packages`. Gutenberg
// solves the same problem the same way (tools/eslint/import-resolver.cjs).
//
// Only workspace packages are handled here. Anything else, including third-party packages,
// falls through to the `node` resolver, since the TypeScript resolver would point those at
// `@types` declarations rather than the runtime code a JavaScript file imports.
const options = {
	conditionNames: [ 'calypso:src', 'import', 'require', 'node', 'browser', 'default' ],
	mainFields: [ 'calypso:src', 'module', 'main' ],
	extensions: [ '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json' ],
	alwaysTryTypes: false,
};

// Returns the workspace package folder (e.g. `packages/foo`) containing `file`, if any.
function getWorkspacePackage( file ) {
	const relative = path.relative( repoRoot, file );
	if ( relative.includes( 'node_modules' ) ) {
		return null;
	}
	return relative.match( /^(packages|apps)\/[^/]+/ )?.[ 0 ] ?? null;
}

exports.interfaceVersion = 2;

exports.resolve = function ( source, file ) {
	const fromPackage = getWorkspacePackage( file );
	const isRelative = source.startsWith( '.' ) || path.isAbsolute( source );
	// Relative imports are resolved within workspace packages only, whose `export *`
	// chains run through TypeScript files the `node` resolver can't find.
	if ( isRelative && ! fromPackage ) {
		return { found: false };
	}
	const result = typescriptResolver.resolve( source, file, options );
	const toPackage = result.found && result.path && getWorkspacePackage( result.path );
	// A package importing itself by name would resolve to its own folder, which
	// `import/order` treats as internal; leave those to the `node` resolver.
	if ( toPackage && ( isRelative || toPackage !== fromPackage ) ) {
		return result;
	}
	return { found: false };
};

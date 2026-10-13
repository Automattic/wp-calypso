const fs = require( 'fs' );
const path = require( 'path' );
const { ResolverFactory, CachedInputFileSystem } = require( 'enhanced-resolve' );

const repoRoot = path.resolve( __dirname, '..' );

// Resolves workspace packages to their `calypso:src` entry, like webpack and Jest do,
// so import rules check package source and don't depend on `yarn build-packages`.
// Relative imports are handled only within workspace packages, whose source may be
// TypeScript. Anything else falls through to the next resolver.
const resolver = ResolverFactory.createResolver( {
	fileSystem: new CachedInputFileSystem( fs, 4000 ),
	useSyncFileSystemCalls: true,
	// Keep the `node_modules` path so `import/order` still sees workspace packages as external.
	symlinks: false,
	extensions: [ '.json', '.js', '.mjs', '.jsx', '.ts', '.tsx' ],
	mainFields: [ 'calypso:src', 'module', 'main' ],
	conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
} );

// Returns the workspace package folder (e.g. `packages/foo`) containing `file`, if any.
function getWorkspacePackage( file ) {
	const relative = path.relative( repoRoot, fs.realpathSync( file ) );
	if ( relative.includes( 'node_modules' ) ) {
		return null;
	}
	return relative.match( /^(packages|apps)\/[^/]+/ )?.[ 0 ] ?? null;
}

exports.interfaceVersion = 2;

exports.resolve = function ( source, file ) {
	try {
		const fromPackage = getWorkspacePackage( file );
		const isRelative = source.startsWith( '.' ) || path.isAbsolute( source );
		if ( isRelative && ! fromPackage ) {
			return { found: false };
		}
		const resolved = resolver.resolveSync( {}, path.dirname( file ), source );
		const toPackage = resolved && getWorkspacePackage( resolved );
		// A package importing itself by name resolves to its own folder, which `import/order`
		// would treat as internal; leave those to the next resolver.
		if ( toPackage && ( isRelative || toPackage !== fromPackage ) ) {
			return { found: true, path: resolved };
		}
	} catch {}
	return { found: false };
};

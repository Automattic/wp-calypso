const fs = require( 'fs' ).promises;
const path = require( 'path' );
const globby = require( 'globby' );
const debug = require( 'debug' )( 'effective-module-tree' );
const treeify = require( 'object-treeify' );

// Generator that yields all places were node will look for modules
// For a path like : a/node_modules/b/node_modules/c
// It will generate the candidates:
//		- a/node_modules/b/node_modules/c/node_modules
// 		- a/node_modules/b/node_modules
//		- a/node_modules
//		- node_modules
const candidates = function*( packagePath ) {
	const parts = packagePath.split( path.sep );
	for ( let i = parts.length; i >= 0; i-- ) {
		// This avoid generating .../node_modules/node_modules/...
		if ( parts[ i - 1 ] === 'node_modules' ) continue;
		yield path.join( ...parts.slice( 0, i ), 'node_modules' );
	}
};

// Simplify tree. Once the full tree has been discovered and linked, we need
// to simplify it (i.e. remove unused properties) to generate a format compatible
// with treeify so we can render it (https://www.npmjs.com/package/object-treeify)
const simplify = ( packageDef, parents ) => {
	// This means the dependency couldn't be found. Maybe a missing `npm install` ?
	if ( ! packageDef ) return;

	const name = `${ packageDef.name }@${ packageDef.version }`;

	// Don't get caught in an infinite loop caused by circular dependencies
	if ( parents.includes( name ) ) return { [ name ]: '[Circular]' };

	if ( ! packageDef.linkedDeps ) return { [ name ]: {} };

	// Keep simplifying our deps recursively
	const parentDeps = [ ...parents, name ];
	return {
		[ name ]: packageDef.linkedDeps.reduce(
			( accumulated, dep ) => ( { ...simplify( dep, parentDeps ), ...accumulated } ),
			{}
		),
	};
};

/**
 * How this works:
 *
 * - Find all package.json files
 * - Read them and store it in a map indexed by path
 * - Iterate the map, and for each element, iterate the dependencies
 * - For each dependency, try to find it looking at parent directories
 * - Once everything is linked, produce a simplified map suited for treeify
 * - Print it
 */
const effectiveTree = async () => {
	// Find all package.json files
	const packageJsonPaths = await globby( '**/package.json' );

	// Read all package.json files
	const packagesByPath = new Map();
	await Promise.all(
		packageJsonPaths.map( async packageJsonPath => {
			const content = await fs.readFile( packageJsonPath, 'utf8' );
			const json = JSON.parse( content );
			const packagePath = path.dirname( packageJsonPath );
			packagesByPath.set( packagePath, {
				name: json.name,
				path: packagePath,
				version: json.version,
				deps: Object.keys( json.dependencies || [] ),
			} );
		} )
	);

	// Link all packages
	for ( const packageDef of packagesByPath.values() ) {
		if ( ! packageDef.name ) continue;
		if ( ! packageDef.deps ) continue;
		debug( `Linking ${ packageDef.name }, ${ packageDef.path }` );

		// For each dep, search it in the main packages map and link it
		packageDef.linkedDeps = packageDef.deps.map( dep => {
			debug( `  Linking dep ${ dep }` );
			for ( const candidatePath of candidates( packageDef.path ) ) {
				const candidate = path.join( candidatePath, dep );
				debug( `    Trying ${ candidate }` );

				if ( packagesByPath.has( candidate ) ) {
					return packagesByPath.get( candidate );
				}
			}

			// eslint-disable-next-line no-console
			console.warn( `Can't find a candidate for ${ dep } in ${ packageDef.path }` );
			return null;
		} );
	}

	// Simplify package representation for printing
	const simplifiedPackages = simplify( packagesByPath.get( '.' ), [] );

	return treeify( simplifiedPackages, {
		sortFn: ( a, b ) => a.localeCompare( b ),
	} );
};

module.exports = { effectiveTree, candidates, simplify };

const path = require( 'path' );
const debug = require( 'debug' )( 'effective-module-tree' );
const treeify = require( 'object-treeify' );

/**
 * Generator that yields all places were node will look for modules
 * For a path like : a/node_modules/b/node_modules/c
 * It will generate the candidates:
 *	- a/node_modules/b/node_modules/c/node_modules
 *	- a/node_modules/b/node_modules
 *	- a/node_modules
 *	- node_modules
 *
 * @param {string} packagePath Package path used as seed for the traversal
 */
const candidates = function* ( packagePath ) {
	const parts = packagePath.split( path.sep );
	for ( let i = parts.length; i >= 0; i-- ) {
		// This avoids generating .../node_modules/node_modules/...
		if ( parts[ i - 1 ] === 'node_modules' ) {
			continue;
		}
		// Need to prepend path.sep manually because path.join ignores empty path segments,
		// so it removes the "empty" segment at the beginning of an absolute path.
		yield path.join( path.sep, ...parts.slice( 0, i ), 'node_modules' );
	}
};

/**
 * Recursively finds the dependency tree for a package and its dependencies
 *
 * @param {object} packageJson package.json content of the package
 * @param {string} packagePath Location of package.json, used to decide where to look for deps
 * @param {string[]} parents List of parent dependencies already visited, used to avoid circular loops
 * @param {Map} cache Map used to cache already resolved paths of the dependency tree
 */
const findTree = ( packageJson, packagePath, parents, cache ) => {
	const name = `${ packageJson.name }@${ packageJson.version }`;
	if ( parents.includes( name ) ) {
		debug( `Package ${ name } at ${ packagePath } seems to be a circular dependency!` );
		return { tree: { [ name ]: '[Circular]' }, isCacheable: false };
	}

	// We alredy solved this part of the tree
	if ( cache.has( packagePath ) ) {
		debug(
			`Package ${ name } at ${ packagePath } was already resolved, returning info from cache`
		);
		return {
			tree: cache.get( packagePath ),
			isCacheable: true,
		};
	}

	// For each dependency...
	debug( `Finding dependencies for ${ name } at ${ packagePath }` );
	let treeIsCacheable = true;
	const dependencies = Object.keys( packageJson.dependencies || [] ).reduce(
		( accumulated, dependency ) => {
			let dependencyPath;
			let dependencyJson;

			// Loop over all possible locations of the dependency's package.json
			for ( const candidatePath of candidates( packagePath ) ) {
				dependencyPath = path.join( candidatePath, dependency, 'package.json' );
				debug( `  Trying ${ dependencyPath }` );
				try {
					dependencyJson = require( dependencyPath );
					debug( `  Found!!!` );
					break;
				} catch ( e ) {
					debug( `  Not found` );
					// Path doesn't exists. That's fine, continue with the next candidate.
					continue;
				}
			}

			if ( ! dependencyJson ) {
				// eslint-disable-next-line no-console
				console.warn( `Can't find a candidate for ${ dependency } in ${ packagePath }` );
				return accumulated;
			}

			// Continue finding dependencies recursively.
			const { tree, isCacheable } = findTree(
				dependencyJson,
				dependencyPath,
				[ ...parents, name ],
				cache
			);
			// Propagate 'cacheability': if the package is not cacheable, none of the parents should be.
			treeIsCacheable = treeIsCacheable && isCacheable;
			return {
				...accumulated,
				...tree,
			};
		},
		{}
	);

	const result = { [ name ]: dependencies };
	if ( treeIsCacheable ) cache.set( packagePath, result );
	return { tree: result, isCacheable: treeIsCacheable };
};

/**
 * Finds the effective dependencies tree (aka the logical tree) of a given package
 * givent its package.json
 *
 * @param {string} root Path to package.json
 */
const generateEffectiveTree = ( root ) => {
	const packagePath = path.resolve( root );
	const packageJson = require( path.join( packagePath ) );
	const { tree } = findTree( packageJson, path.dirname( packagePath ), [], new Map() );
	return tree;
};

const getEffectiveTreeAsTree = ( root ) => {
	const tree = generateEffectiveTree( root );
	return treeify( tree, {
		sortFn: ( a, b ) => a.localeCompare( b ),
	} );
};

const getEffectiveTreeAsList = ( root ) => {
	const tree = generateEffectiveTree( root );

	function print( branch, prefix = [] ) {
		return (
			Object.entries( branch )
				// Ensure deps are listed in alphabetical order
				.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
				// For each dep, create a new array with the dep name + all its deps recursively
				.map( ( [ depName, nestedDependencies ] ) => {
					const newPrefix = [ ...prefix, depName ];
					if ( nestedDependencies === '[Circular]' ) {
						return [ [ ...newPrefix, nestedDependencies ] ];
					}
					return [ newPrefix, ...print( nestedDependencies, newPrefix ) ];
				} )
				.flat()
		);
	}

	return print( tree )
		.map( ( line ) => line.join( ' ' ) )
		.join( '\n' );
};

module.exports = { getEffectiveTreeAsTree, getEffectiveTreeAsList, candidates };

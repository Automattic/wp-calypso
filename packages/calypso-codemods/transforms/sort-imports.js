/**
 * This codeshift takes all of the imports for a file, and organizes them into two sections:
 * External dependencies and Internal Dependencies.
 *
 * It is smart enough to retain whether or not a docblock should keep a prettier/formatter pragma
 */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );
const nodeJsDeps = require( 'repl' )._builtinLibs;

function findPkgJson( target ) {
	let root = path.dirname( target );
	while ( root !== '/' ) {
		const filepath = path.join( root, 'package.json' );
		if ( fs.existsSync( filepath ) ) {
			return JSON.parse( fs.readFileSync( filepath, 'utf8' ) );
		}
		root = path.join( root, '../' );
	}
	throw new Error( 'could not find a pkg json' );
}

/**
 * Gather all of the external deps and throw them in a set
 */
const getPackageJsonDeps = ( function () {
	let packageJsonDeps;

	return ( root ) => {
		if ( packageJsonDeps ) {
			return packageJsonDeps;
		}

		const json = findPkgJson( root );
		packageJsonDeps = []
			.concat( nodeJsDeps )
			.concat( json.dependencies ? Object.keys( json.dependencies ) : [] )
			.concat( json.devDependencies ? Object.keys( json.devDependencies ) : [] );

		return new Set( packageJsonDeps );
	};
} )();

const externalBlock = {
	type: 'Block',
	value: '*\n * External dependencies\n ',
};
const internalBlock = {
	type: 'Block',
	value: '*\n * Internal dependencies\n ',
};

/**
 * Returns true if the given text contains @format.
 * within its first docblock. False otherwise.
 *
 * @param  {string}  text text to scan for the format keyword within the first docblock
 * @returns {boolean}      True if @format is found, otherwise false
 */
const shouldFormat = ( text ) => {
	const firstDocBlockStartIndex = text.indexOf( '/**' );

	if ( -1 === firstDocBlockStartIndex ) {
		return false;
	}

	const firstDocBlockEndIndex = text.indexOf( '*/', firstDocBlockStartIndex + 1 );

	if ( -1 === firstDocBlockEndIndex ) {
		return false;
	}

	const firstDocBlockText = text.substring( firstDocBlockStartIndex, firstDocBlockEndIndex + 1 );
	return firstDocBlockText.indexOf( '@format' ) >= 0;
};

/**
 * Removes the extra newlines between two import statements
 *
 * @param  {string} str Input string
 * @returns {string}     Transformed string
 */
const removeExtraNewlines = ( str ) => str.replace( /(import.*\n)\n+(import)/g, '$1$2' );

/**
 * Adds a newline in between the last import of external deps + the internal deps docblock
 *
 * @param  {string} str Input string
 * @returns {string}     Transformed string
 */
const addNewlineBeforeDocBlock = ( str ) => str.replace( /(import.*\n)(\/\*\*)/, '$1\n$2' );

/**
 *
 * @param {Array} importNodes the import nodes to sort
 * @returns {Array} the sorted set of import nodes
 */
const sortImports = ( importNodes ) => _.sortBy( importNodes, ( node ) => node.source.value );

module.exports = function ( file, api ) {
	const j = api.jscodeshift;
	const src = j( file.source );
	const includeFormatBlock = shouldFormat( src.toSource().toString() );
	const declarations = src.find( j.ImportDeclaration );

	// this is dependent on the projects package.json file which is why its initialized so late
	// we recursively search up from the file.path to figure out the location of the package.json file
	const externalDependenciesSet = getPackageJsonDeps( file.path );
	const isExternal = ( importNode ) =>
		externalDependenciesSet.has( importNode.source.value.split( '/' )[ 0 ] );

	// if there are no deps at all, then return early.
	if ( _.isEmpty( declarations.nodes() ) ) {
		return file.source;
	}

	const withoutComments = declarations.nodes().map( ( node ) => {
		node.comments = '';
		return node;
	} );

	const externalDeps = sortImports( withoutComments.filter( ( node ) => isExternal( node ) ) );
	const internalDeps = sortImports( withoutComments.filter( ( node ) => ! isExternal( node ) ) );

	if ( externalDeps[ 0 ] ) {
		externalDeps[ 0 ].comments = [ externalBlock ];
	}
	if ( internalDeps[ 0 ] ) {
		internalDeps[ 0 ].comments = [ internalBlock ];
	}

	const newDeclarations = []
		.concat( includeFormatBlock && '/** @format */' )
		.concat( externalDeps )
		.concat( internalDeps );

	let isFirst = true;
	/* remove all imports and insert the new ones in the first imports place */
	declarations.replaceWith( () => {
		if ( isFirst ) {
			isFirst = false;
			return newDeclarations;
		}
		return;
	} );

	return addNewlineBeforeDocBlock( removeExtraNewlines( src.toSource() ) );
};

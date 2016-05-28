#!/usr/bin/env node

/**
 * This script generates a usage counts for the dependecies of a list of modules.
 * It accepts a newline-delimited list of .js and|or .jsx files
 * as its input, and writes the index to server/devdocs/components-usage-stats.json
 */

var async = require( 'async' ),
	camelCase = require( 'lodash/camelCase' ),
	config = require( 'config' ),
	fs = require( 'fs' ),
	fspath = require( 'path' ),
	root = fspath.dirname( fspath.join( __dirname, '..', '..' ) ),

	// Copyright (c) 2014-present, Facebook, Inc. See CREDITS.md#facebook/node-hastemodules
	replacePatterns = {
		BLOCK_COMMENT_RE: /(?:\/\*(.|\n)*?\*\/)|(\/\/.+(\n|$))/g,
		LINE_COMMENT_RE: /\/\/.+(\n|$)/g,
		IMPORT_RE: /(\bimport\s+?(?:.+\s+?from\s+?)?)(['"])([^'"]+)(\2)/g,
		EXPORT_RE: /(\bexport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g,
		REQUIRE_RE: /(\brequire\s*?\(\s*?)(['"])([^'"]+)(\2\s*?\))/g
	};

function main() {
	// extract list of files to index and remove leading ./'s
	var fileList,
		outFilePath = 'server/devdocs/components-usage-stats.json';

	fileList = process.
		argv.
		splice( 2, process.argv.length ).
		map( function( fileWithPath ) {
			return fileWithPath.replace( /^\.\//, '' );
		} );

	if ( fileList.length === 0 ) {
		process.stderr.write( 'You must pass a list of files to process (try "make server/devdocs/components-usage-stats.js"' );
		process.exit( 1 );
	}

	if ( ! config.isEnabled( 'devdocs/components-usage-stats' ) ) {
		saveUsageStats( {}, outFilePath );
		process.exit( 0 );
	}

	getModulesWithDependencies( root, fileList )
		.then( function( modulesWithDependencies ) {
			var usageStats = generateUsageStats( modulesWithDependencies );
			saveUsageStats( usageStats, outFilePath );
			process.exit( 0 );
		} )
		.catch( function( error ) {
			console.error( "An error occurred while processing the files: \n\t", error );
			process.exit( 1 );
		} );
}

/**
 * Calculate the modules dependencies.
 * Produces an object that has the following structure:
 * {
 *  'A': [dep1, dep2, dep3, ...],
 *  'B': [dep1, dep2, dep3, ...]
 * }
 * @param {string} root BasePath to resolve the files' path
 * @param {Array} fileList A list of file names
 * @returns {Promise}
 */

function getModulesWithDependencies( root, fileList ) {
	return new Promise( function( resolve, reject ) {
		var modulesWithDeps = {};

		async.each(
			fileList,
			function( fileWithPath, next ) {
				fs.readFile(
					fspath.join( root, fileWithPath ),
					{ encoding: 'utf8' },
					function( err, data ) {
						var deps;

						if ( err ) {
							return next( err );
						}
						// get the dependencies
						deps = getDependencies( data );
						if ( deps.length ) {
							modulesWithDeps[ fileWithPath ] = deps;
						}
						next( null );
					}
				);
			},
			function( err ) {
				if ( err ) {
					return reject( err );
				}

				return resolve( modulesWithDeps );
			}
		);
	} );
}

/**
 * Extract all required modules from a `code` string.
 * Copyright (c) 2014-present, Facebook, Inc. See CREDITS.md#facebook/node-haste
 *
 * @param {string} code The source code string to parse
 * @returns {array} An array of required modules, if any
 */
function getDependencies( code ) {
	var cache = Object.create( null );
	var deps = [];

	function addDependency( dep ) {
		if ( !cache[ dep ] ) {
			cache[ dep ] = true;
			deps.push( dep );
		}
	}

	code
		.replace( replacePatterns.BLOCK_COMMENT_RE, '' )
		.replace( replacePatterns.LINE_COMMENT_RE, '' )
		.replace( replacePatterns.IMPORT_RE, function( match, pre, quot, dep ) {
			addDependency( dep );
			return match;
		} )
		.replace( replacePatterns.EXPORT_RE, function( match, pre, quot, dep ) {
			addDependency( dep );
			return match;
		} )
		.replace( replacePatterns.REQUIRE_RE, function( match, pre, quot, dep ) {
			addDependency( dep );
		} );

	return deps;
}

/**
 * Given an object of modules with dependencies
 * generate a stats object with the usage counts:
 * {
 *  'A': { count: 2 },
 *  'B': { count: 10 }
 * }
 * @param {object} modules An object of modules with dependencies
 * @returns {object} An object with the usage stats for each dependency
 */
function generateUsageStats( modules ) {
	function getCamelCasedDepName( dep ) {
		return dep.split( '/' ).map( function( part ) {
			return camelCase( part );
		} ).join( '/' );
	}
	return Object.keys( modules ).reduce( function( target, moduleName ) {
		var deps = modules[ moduleName ];
		deps.forEach( function( dependency ) {
			const camelCasedDepName = getCamelCasedDepName( dependency );
			if ( ! target[ camelCasedDepName ] ) {
				target[ camelCasedDepName ] = { count: 0 };
			}
			target[ camelCasedDepName ].count += 1;
		} );
		return target;
	}, {} );
}

function saveUsageStats( usageStats, filePath ) {
	var json = jsFromJSON( JSON.stringify( usageStats, null, "\t" ) );
	fs.writeFileSync( fspath.join( root, filePath ), json );
}

/**
 * Some characters in JSON are invalid in JS. Replace them with ones that are.
 *
 * @copyright (c) 2009-2014 TJ Holowaychuk <tj@vision-media.ca>.
 * @license See CREDITS.md.
 * @see https://github.com/strongloop/express/blob/b78bd3d1fd6caf8228a1875078fecce936cb2e46/lib/response.js#L293
 * @param {string} json Input json string
 * @returns {string} Sanitized json string
 */
function jsFromJSON( json ) {
	// some characters in JSON are invalid in JS
	// lifted from https://github.com/strongloop/express/blob/b78bd3d1fd6caf8228a1875078fecce936cb2e46/lib/response.js#L293
	return json.replace( /\u2028/g, '\\u2028' ).replace( /\u2029/g, '\\u2029' );
}

main();

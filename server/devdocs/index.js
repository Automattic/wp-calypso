/**
 * External dependencies
 */

import express from 'express';
import fs from 'fs';
import fspath from 'path';
import marked from 'marked';
import lunr from 'lunr';
import { find, escape as escapeHTML } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import searchIndex from 'devdocs/search-index';
import componentsUsageStats from 'devdocs/components-usage-stats.json';

const root = fs.realpathSync( fspath.join( __dirname, '..', '..' ) ),
	docsIndex = lunr.Index.load( searchIndex.index ),
	documents = searchIndex.documents;

/**
 * Constants
 */
const SNIPPET_PAD_LENGTH = 40;
const DEFAULT_SNIPPET_LENGTH = 100;

/**
 * Query the index using lunr.
 * We store the documents and index in memory for speed,
 * and also because lunr.js is designed to be memory resident
 * @param {object} query The search query for lunr
 * @returns {array} The results from the query
 */
function queryDocs( query ) {
	return docsIndex.search( query ).map( ( result ) => {
		const doc = documents[ result.ref ],
			snippet = makeSnippet( doc, query );

		return {
			path: doc.path,
			title: doc.title,
			snippet: snippet
		};
	} );
}

/**
 * Return an array of results based on the provided filenames
 * @param {array} filePaths An array of file paths
 * @returns {array} The results from the the docs
 */
function listDocs( filePaths ) {
	return filePaths.map( ( path ) => {
		const doc = find( documents, ( entry ) => entry.path === path );

		if ( doc ) {
			return {
				path: path,
				title: doc.title,
				snippet: defaultSnippet( doc )
			};
		}

		return {
			path: path,
			title: 'Not found: ' + path,
			snippet: ''
		};
	} );
}

/**
 * Extract a snippet from a document, capturing text either side of
 * any term(s) featured in a whitespace-delimited search query.
 * We look for up to 3 matches in a document and concatenate them.
 * @param {object} doc The document to extract the snippet from
 * @param {object} query The query to be searched for
 * @returns {string} A snippet from the document
 */
function makeSnippet( doc, query ) {
	// generate a regex of the form /[^a-zA-Z](term1|term2)/ for the query "term1 term2"
	const termRegexMatchers = lunr.tokenizer( query )
		.map( ( term ) => escapeRegexString( term ) );
	const termRegexString = '[^a-zA-Z](' + termRegexMatchers.join( '|' ) + ')';
	const termRegex = new RegExp( termRegexString, 'gi' );
	const snippets = [];
	let match;

	// find up to 4 matches in the document and extract snippets to be joined together
	// TODO: detect when snippets overlap and merge them.
	while ( ( match = termRegex.exec( doc.body ) ) !== null && snippets.length < 4 ) {
		const matchStr = match[ 1 ],
			index = match.index + 1,
			before = doc.body.substring( index - SNIPPET_PAD_LENGTH, index ),
			after = doc.body.substring( index + matchStr.length, index + matchStr.length + SNIPPET_PAD_LENGTH );

		snippets.push( before +
			'<mark>' + matchStr + '</mark>' +
			after
		);
	}

	if ( snippets.length ) {
		return '…' + snippets.join( ' … ' ) + '…';
	}

	return defaultSnippet( doc );
}

/**
 * Escapes a string
 * @param {string} str The string to escape
 * @returns {string} An escaped string
 */
function escapeRegexString( str ) {
	// taken from: https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
	const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	return str.replace( matchOperatorsRe, '\\$&' );
}

/**
 * Generate a standardized snippet
 * @param {object} doc The document from which to generate the snippet
 * @returns {string} The snippet
 */
function defaultSnippet( doc ) {
	const content = doc.body.substring( 0, DEFAULT_SNIPPET_LENGTH );
	return escapeHTML( content ) + '…';
}

/**
 * Gets a list of subdirectories from a given path
 * @param {string} path The path to get the list from
 * @returns {Array} The list of subdirectories
 */
function listDirectories( path ) {
	try {
		return fs.readdirSync( path ).filter( ( file ) => {
			try {
				return fs.statSync( fspath.join( path, file ) ).isDirectory();
			} catch ( err ) {
				return false;
			}
		} );
	} catch ( err ) {
		return [];
	}
}

/**
 * Recursively searches a path for a subdirectory with a given name
 * @param {string} startPath The path to start searching from
 * @param {string} name The name to search for
 * @param {Number} depth The depth to go down, default is 2 levels, -1 for infinite
 * @returns {Array} List of paths that matched the name
 */
function findDirectoryWithName( startPath, name, depth = 2 ) {
	// stop searching once we exceed our depth
	if ( depth === 0 ) {
		return [];
	}

	const children = listDirectories( startPath );

	// this is quite likely the dumbest way to do this ... but it currently covers all existing cases
	const singularName = name.substring( 0, name.length - 1 );

	const matches = children
		.filter( ( dir ) => dir === name || dir === singularName )
		.map( ( dir ) => fspath.join( startPath, dir ) );

	if ( matches.length > 0 ) {
		return matches;
	}

	// flatten the results
	return [].concat.apply( [],
		children.map( ( dir ) =>
			findDirectoryWithName( fspath.join( startPath, dir ), name, depth - 1 )
		)
	);
}

/**
 * Given an object of { module: dependenciesArray }
 * it filters out modules that contain the world "docs/"
 * and that are not components (i.e. they don't start with "components/").
 * It also removes the "components/" prefix from the modules name.
 *
 * @param {object} modulesWithDependences An object of modules - dipendencies pairs
 * @returns {object} A reduced set of modules.
 */
function reduceComponentsUsageStats( modulesWithDependences ) {
	return Object.keys( modulesWithDependences )
		.filter( ( moduleName ) =>
			moduleName.indexOf( 'components/' ) === 0 &&
				moduleName.indexOf( '/docs' ) === -1
		)
		.reduce( ( target, moduleName ) => {
			const name = moduleName.replace( 'components/', '' );
			target[ name ] = modulesWithDependences[ moduleName ];
			return target;
		}, {} );
}

module.exports = function() {
	const app = express();

	// this middleware enforces access control
	app.use( '/devdocs/service', ( request, response, next ) => {
		if ( ! config.isEnabled( 'devdocs' ) ) {
			response.status( 404 );
			next( 'Not found' );
		} else {
			next();
		}
	} );

	// search the documents using a search phrase "q"
	app.get( '/devdocs/service/search', ( request, response ) => {
		const query = request.query.q;

		if ( ! query ) {
			response
				.status( 400 )
				.json( {
					message: 'Missing required "q" parameter'
				} );
			return;
		}

		response.json( queryDocs( query ) );
	} );

	// return a listing of documents from filenames supplied in the "files" parameter
	app.get( '/devdocs/service/list', ( request, response ) => {
		const files = request.query.files;

		if ( ! files ) {
			response
				.status( 400 )
				.json( {
					message: 'Missing required "files" parameter'
				} );
			return;
		}

		response.json( listDocs( files.split( ',' ) ) );
	} );

	// return the HTML content of a document (assumes that the document is in markdown format)
	app.get( '/devdocs/service/content', ( request, response ) => {
		let path = request.query.path;
		const component = request.query.component;

		if ( ! ( path || component ) ) {
			response
				.status( 400 )
				.send( 'Need to provide a file path (e.g. path=client/devdocs/README.md) or component (e.g. component=author-selector)' );
			return;
		}

		// if we are getting readme contents, the old way ;)
		if ( path ) {
			if ( ! /\.md$/.test( path ) ) {
				path = fspath.join( path, 'README.md' );
			}

			try {
				path = fs.realpathSync( fspath.join( root, path ) );
			} catch ( err ) {
				path = null;
			}

			if ( ! path || path.substring( 0, root.length + 1 ) !== root + '/' ) {
				response
					.status( 404 )
					.send( 'File does not exist' );
				return;
			}

			const fileContents = fs.readFileSync( path, { encoding: 'utf8' } );

			response.send( marked( fileContents ) );
		}

		if ( component ) {
			// we need to search the entire component tree for this guy ... :(
			try {
				const basePath = fs.realpathSync( fspath.join( root, 'client' ) );
				const results = [
					fspath.join( basePath, 'blocks' ),
					fspath.join( basePath, 'components' )
				]
					.map( ( search ) => findDirectoryWithName( search, component, 1 ) );
				const files = [].concat.apply( [], results );

				if ( files.length === 0 ) {
					response
						.status( 404 )
						.send( 'Unable to find component' );
					return;
				}

				const readme = fspath.join( files[ 0 ], 'README.md' );

				if ( ! readme || readme.substring( 0, root.length + 1 ) !== root + '/' ) {
					response
						.status( 404 )
						.send( 'Unable to find README for component' );
					return;
				}

				response.send( fs.readFileSync( readme, { encoding: 'utf8' } ) );
			} catch ( err ) {
				response
					.status( 404 )
					.send( 'Unable to find component' );
			}
		}
	} );

	// return json for the components usage stats
	app.get( '/devdocs/service/components-usage-stats', ( request, response ) => {
		const usageStats = reduceComponentsUsageStats( componentsUsageStats );
		response.json( usageStats );
	} );

	return app;
};

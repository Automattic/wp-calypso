/** @format */
/**
 * External dependencies
 */

import express from 'express';
import fs from 'fs';
import fspath from 'path';
import marked from 'marked';
import lunr from 'lunr';
import { find, escape as escapeHTML } from 'lodash';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';

/**
 * Internal dependencies
 */
import config from 'config';
import searchIndex from 'devdocs/search-index';
import componentsUsageStats from 'devdocs/components-usage-stats.json';

const root = fs.realpathSync( fspath.join( __dirname, '..', '..' ) ),
	docsIndex = lunr.Index.load( searchIndex.index ),
	documents = searchIndex.documents,
	selectors = require( './selectors' );

/**
 * Constants
 */
const SNIPPET_PAD_LENGTH = 40;
const DEFAULT_SNIPPET_LENGTH = 100;

// Alias `javascript` language to `es6`
Prism.languages.es6 = Prism.languages.javascript;

// Configure marked to use Prism for code-block highlighting.
marked.setOptions( {
	highlight: function( code, language ) {
		const syntax = Prism.languages[ language ];
		return syntax ? Prism.highlight( code, syntax ) : code;
	},
} );

/**
 * Query the index using lunr.
 * We store the documents and index in memory for speed,
 * and also because lunr.js is designed to be memory resident
 * @param {object} query The search query for lunr
 * @returns {array} The results from the query
 */
function queryDocs( query ) {
	return docsIndex.search( query ).map( result => {
		const doc = documents[ result.ref ],
			snippet = makeSnippet( doc, query );

		return {
			path: doc.path,
			title: doc.title,
			snippet: snippet,
		};
	} );
}

/**
 * Return an array of results based on the provided filenames
 * @param {array} filePaths An array of file paths
 * @returns {array} The results from the docs
 */
function listDocs( filePaths ) {
	return filePaths.map( path => {
		const doc = find( documents, entry => entry.path === path );

		if ( doc ) {
			return {
				path: path,
				title: doc.title,
				snippet: defaultSnippet( doc ),
			};
		}

		return {
			path: path,
			title: 'Not found: ' + path,
			snippet: '',
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
	const termRegexMatchers = lunr.tokenizer( query ).map( term => escapeRegexString( term ) );
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
			after = doc.body.substring(
				index + matchStr.length,
				index + matchStr.length + SNIPPET_PAD_LENGTH
			);

		snippets.push( before + '<mark>' + matchStr + '</mark>' + after );
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
		.filter(
			moduleName =>
				moduleName.indexOf( 'components/' ) === 0 && moduleName.indexOf( '/docs' ) === -1
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
			response.status( 400 ).json( {
				message: 'Missing required "q" parameter',
			} );
			return;
		}

		response.json( queryDocs( query ) );
	} );

	// return a listing of documents from filenames supplied in the "files" parameter
	app.get( '/devdocs/service/list', ( request, response ) => {
		const files = request.query.files;

		if ( ! files ) {
			response.status( 400 ).json( {
				message: 'Missing required "files" parameter',
			} );
			return;
		}

		response.json( listDocs( files.split( ',' ) ) );
	} );

	// return the HTML content of a document (assumes that the document is in markdown format)
	app.get( '/devdocs/service/content', ( request, response ) => {
		let path = request.query.path;

		if ( ! path ) {
			response
				.status( 400 )
				.send( 'Need to provide a file path (e.g. path=client/devdocs/README.md)' );
			return;
		}

		if ( ! /\.md$/.test( path ) ) {
			path = fspath.join( path, 'README.md' );
		}

		try {
			path = fs.realpathSync( fspath.join( root, path ) );
		} catch ( err ) {
			path = null;
		}

		if ( ! path || path.substring( 0, root.length + 1 ) !== root + fspath.sep ) {
			response.status( 404 ).send( 'File does not exist' );
			return;
		}

		const fileContents = fs.readFileSync( path, { encoding: 'utf8' } );

		response.send( marked( fileContents ) );
	} );

	// return json for the components usage stats
	app.get( '/devdocs/service/components-usage-stats', ( request, response ) => {
		const usageStats = reduceComponentsUsageStats( componentsUsageStats );
		response.json( usageStats );
	} );

	// In environments where enabled, prime the selectors search cache whenever
	// a request is made for DevDocs
	app.use( '/devdocs', function( request, response, next ) {
		selectors.prime();
		next();
	} );

	app.use( '/devdocs/service/selectors', selectors.router );

	return app;
};

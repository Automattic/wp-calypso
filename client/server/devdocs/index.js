/**
 * External dependencies
 */
import express from 'express';
import fs from 'fs';
import fspath from 'path';
import marked from 'marked';
import lunr from 'lunr';
import { escapeRegExp, find, escape as escapeHTML, once } from 'lodash';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import searchSelectors from './selectors';

const loadSearchIndex = once( async () => {
	const searchIndexPath = fspath.resolve( __dirname, '../../../build/devdocs-search-index.json' );
	const searchIndex = await fs.promises.readFile( searchIndexPath, 'utf-8' );
	const { index, documents } = JSON.parse( searchIndex );
	return {
		documents,
		index: lunr.Index.load( index ),
	};
} );

/**
 * Constants
 */
const SNIPPET_PAD_LENGTH = 40;
const DEFAULT_SNIPPET_LENGTH = 100;

// Alias `javascript` language to `es6`
Prism.languages.es6 = Prism.languages.javascript;

// Configure marked to use Prism for code-block highlighting.
marked.setOptions( {
	highlight: function ( code, language ) {
		const syntax = Prism.languages[ language ];
		return syntax ? Prism.highlight( code, syntax ) : code;
	},
} );

/**
 * Query the index using lunr.
 * We store the documents and index in memory for speed,
 * and also because lunr.js is designed to be memory resident
 *
 * @param {object} query The search query for lunr
 * @returns {Array} The results from the query
 */
async function queryDocs( query ) {
	const { index, documents } = await loadSearchIndex();
	const results = index.search( query );
	return results.map( ( result ) => {
		const doc = documents[ result.ref ];

		return {
			path: doc.path,
			title: doc.title,
			snippet: makeSnippet( doc, query ),
		};
	} );
}

/**
 * Return an array of results based on the provided filenames
 *
 * @param {Array} filePaths An array of file paths
 * @returns {Array} The results from the docs
 */
async function listDocs( filePaths ) {
	const { documents } = await loadSearchIndex();
	return filePaths.map( ( path ) => {
		const doc = find( documents, { path } );

		if ( doc ) {
			return {
				path,
				title: doc.title,
				snippet: defaultSnippet( doc ),
			};
		}

		return {
			path,
			title: 'Not found: ' + path,
			snippet: '',
		};
	} );
}

/**
 * Extract a snippet from a document, capturing text either side of
 * any term(s) featured in a whitespace-delimited search query.
 * We look for up to 3 matches in a document and concatenate them.
 *
 * @param {object} doc The document to extract the snippet from
 * @param {object} query The query to be searched for
 * @returns {string} A snippet from the document
 */
function makeSnippet( doc, query ) {
	// generate a regex of the form /[^a-zA-Z](term1|term2)/ for the query "term1 term2"
	const termRegexMatchers = lunr
		.tokenizer( query )
		.map( ( token ) => token.update( escapeRegExp ) );
	const termRegexString = '[^a-zA-Z](' + termRegexMatchers.join( '|' ) + ')';
	const termRegex = new RegExp( termRegexString, 'gi' );
	const snippets = [];
	let match;

	// find up to 4 matches in the document and extract snippets to be joined together
	// TODO: detect when snippets overlap and merge them.
	while ( ( match = termRegex.exec( doc.body ) ) !== null && snippets.length < 4 ) {
		const matchStr = match[ 1 ];
		const index = match.index + 1;
		const before = doc.body.substring( index - SNIPPET_PAD_LENGTH, index );
		const after = doc.body.substring(
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
 * Generate a standardized snippet
 *
 * @param {object} doc The document from which to generate the snippet
 * @returns {string} The snippet
 */
function defaultSnippet( doc ) {
	const content = doc.body.substring( 0, DEFAULT_SNIPPET_LENGTH );
	return escapeHTML( content ) + '…';
}

function normalizeDocPath( path ) {
	// if the path is a directory, default to README.md in that dir
	if ( ! path.endsWith( '.md' ) ) {
		path = fspath.join( path, 'README.md' );
	}

	// Remove the optional leading `/` to make the path relative, i.e., convert `/client/README.md`
	// to `client/README.md`. The `path` query arg can use both forms.
	path = path.replace( /^\//, '' );

	return path;
}

export default function devdocs() {
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
	app.get( '/devdocs/service/search', async ( request, response ) => {
		const { q: query } = request.query;

		if ( ! query ) {
			response.status( 400 ).json( { message: 'Missing required "q" parameter' } );
			return;
		}

		try {
			const result = await queryDocs( query );
			response.json( result );
		} catch ( error ) {
			console.error( error );
			response.status( 400 ).json( { message: 'Internal server error: no document index' } );
		}
	} );

	// return a listing of documents from filenames supplied in the "files" parameter
	app.get( '/devdocs/service/list', async ( request, response ) => {
		const { files } = request.query;

		if ( ! files ) {
			response.status( 400 ).json( { message: 'Missing required "files" parameter' } );
			return;
		}

		try {
			const result = await listDocs( files.split( ',' ) );
			response.json( result );
		} catch ( error ) {
			console.error( error );
			response.status( 400 ).json( { message: 'Internal server error: no document index' } );
		}
	} );

	// return the content of a document in the given format (assumes that the document is in
	// markdown format)
	app.get( '/devdocs/service/content', async ( request, response ) => {
		const { path, format = 'html' } = request.query;

		if ( ! path ) {
			response
				.status( 400 )
				.send( 'Need to provide a file path (e.g. path=client/devdocs/README.md)' );
			return;
		}

		try {
			const { documents } = await loadSearchIndex();
			const doc = find( documents, { path: normalizeDocPath( path ) } );

			if ( ! doc ) {
				response.status( 404 ).send( 'File does not exist' );
				return;
			}

			response.send( 'html' === format ? marked( doc.content ) : doc.content );
		} catch ( error ) {
			console.error( error );
			response.status( 400 ).json( { message: 'Internal server error: no document index' } );
		}
	} );

	app.get( '/devdocs/service/selectors', searchSelectors );

	return app;
}

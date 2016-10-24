/**
 * Extenal dependencies
 */
var express = require( 'express' ),
	fs = require( 'fs' ),
	fspath = require( 'path' ),
	marked = require( 'marked' ),
	lunr = require( 'lunr' ),
	find = require( 'lodash/find' ),
	escapeHTML = require( 'lodash/escape' );

/**
 * Internal dependencies
 */
var	config = require( 'config' ),
	root = fs.realpathSync( fspath.join( __dirname, '..', '..' ) ),
	searchIndex = require( 'devdocs/search-index' ),
	docsIndex = lunr.Index.load( searchIndex.index ),
	documents = searchIndex.documents,
	componentsUsageStats = require( 'devdocs/components-usage-stats.json' );

/**
 * Constants
 */
var SNIPPET_PAD_LENGTH = 40;
var DEFAULT_SNIPPET_LENGTH = 100;

/*
 * Query the index using lunr.
 * We store the documents and index in memory for speed,
 * and also because lunr.js is designed to be memory resident
 */
function queryDocs( query ) {
	var results = docsIndex.search( query ).map( function( result ) {
		var doc = documents[result.ref],
			snippet = makeSnippet( doc, query );

		return {
			path: doc.path,
			title: doc.title,
			snippet: snippet
		};
	} );

	return results;
}

/*
 * Return an array of results based on the provided filenames
 */
function listDocs( filePaths ) {
	var results = filePaths.map( function( path ) {
		var doc = find( documents, function( entry ) {
			return entry.path === path;
		} );

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
	return results;
}

/*
 * Extract a snippet from a document, capturing text either side of
 * any term(s) featured in a whitespace-delimited search query.
 * We look for up to 3 matches in a document and concatenate them.
 */
function makeSnippet( doc, query ) {
	// generate a regex of the form /[^a-zA-Z](term1|term2)/ for the query "term1 term2"
	const termRegexMatchers = lunr.tokenizer( query )
		.map( function( term ) {
			return escapeRegexString( term );
		} );
	const termRegexString = '[^a-zA-Z](' + termRegexMatchers.join( '|' ) + ')';
	const termRegex = new RegExp( termRegexString, 'gi' );
	const snippets = [];
	let match;

	// find up to 4 matches in the document and extract snippets to be joined together
	// TODO: detect when snippets overlap and merge them.
	while ( ( match = termRegex.exec( doc.body ) ) !== null && snippets.length < 4 ) {
		const matchStr = match[1],
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
	};

	return defaultSnippet( doc );
}

function escapeRegexString( str ) {
	// taken from: https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	return str.replace( matchOperatorsRe, '\\$&' );
}

function defaultSnippet( doc ) {
	var content = doc.body.substring( 0, DEFAULT_SNIPPET_LENGTH );
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
		.filter( function( moduleName ) {
			return moduleName.indexOf( 'components/' ) === 0 &&
				moduleName.indexOf( '/docs' ) === -1;
		} )
		.reduce( function( target, moduleName ) {
			var name = moduleName.replace( 'components/', '' );
			target[ name ] = modulesWithDependences[ moduleName ];
			return target;
		}, {} );
}

module.exports = function() {
	var app = express();

	// this middleware enforces access control
	app.use( '/devdocs/service', function( request, response, next ) {
		if ( ! config.isEnabled( 'devdocs' ) ) {
			response.status( 404 );
			next( 'Not found' );
		} else {
			next();
		}
	} );

	// search the documents using a search phrase "q"
	app.get( '/devdocs/service/search', function( request, response ) {
		var query = request.query.q;

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
	app.get( '/devdocs/service/list', function( request, response ) {
		var files = request.query.files;

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
	app.get( '/devdocs/service/content', function( request, response ) {
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

		if ( ! path || path.substring( 0, root.length + 1 ) !== root + '/' ) {
			response
				.status( 404 )
				.send( 'File does not exist' );
			return;
		}

		const fileContents = fs.readFileSync( path, { encoding: 'utf8' } );

		response.send( marked( fileContents ) );
	} );

	// return json for the components usage stats
	app.get( '/devdocs/service/components-usage-stats', function( request, response ) {
		var usageStats = reduceComponentsUsageStats( componentsUsageStats );
		response.json( usageStats );
	} );

	return app;
};

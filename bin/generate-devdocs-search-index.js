#!/usr/bin/env node

/**
 * This script generates a Lunr.js index and document array suitable for server-side
 * documentation search. It finds all .md files that are part of the Calypso repository
 * and writes the index to server/devdocs/search-index.js .
 *
 * The design is currently limited by available RAM, both during indexing and serving the
 * content. A more scalable solution would need to use a separate indexing service like Sphinx.
 */

const fs = require( 'fs' );
const lunr = require( 'lunr' );
const globby = require( 'globby' );

function main() {
	// Build a list of all .md files in allowed subdirectories...
	const dirList = [
		'assets',
		'bin',
		'client',
		'config',
		'docs',
		'packages',
		'test',
		'.github',
	].map( ( dir ) => dir + '/**/*.md' );
	// ... and the current directory
	dirList.push( '*.md' );
	// don't descend into node_modules
	dirList.push( '!**/node_modules/**' );

	const documents = globby
		.sync( dirList )
		.map( documentFromFile )
		.filter( ( doc ) => doc.title && doc.body /* skip empty/invalid files */ );

	writeSearchIndex( documents, 'client/server/devdocs/search-index.js' );
}

function writeSearchIndex( documents, searchIndexPath ) {
	const idx = lunr( function () {
		this.field( 'title', { boost: 10 } );
		this.field( 'body' );

		documents.forEach( ( doc, index ) => {
			/*
			 * we use the array index as the document id
			 * so that we can look the preprocessed contents
			 * up out of the "documents" array also exported below
			 */

			const indexDoc = {};
			indexDoc.id = index;
			indexDoc.title = doc.title;

			//preprocess body to remove non-word characters, e.g. <optgroup> becomes optgroup
			indexDoc.body = doc.body.replace( /<>\/="/, ' ' );

			this.add( indexDoc );
		} );
	} );

	const searchIndexJS =
		'module.exports.index = ' +
		jsFromJSON( JSON.stringify( idx ) ) +
		';' +
		'module.exports.documents = ' +
		jsFromJSON( JSON.stringify( documents ) ) +
		';';

	fs.writeFileSync( searchIndexPath, searchIndexJS );
}

// Some characters in JSON are invalid in JS. Replace them with valid ones.
// See: https://stackoverflow.com/questions/16686687/json-stringify-and-u2028-u2029-check
function jsFromJSON( json ) {
	return json.replace( /\u2028/g, '\\u2028' ).replace( /\u2029/g, '\\u2029' );
}

/**
 * Strip formatting from content and extract the title and
 * return a basic JSON object suitable for indexing
 */

function documentFromFile( path ) {
	const content = fs.readFileSync( path, { encoding: 'utf8' } );

	const data = content
		.replace( /^\s*[\r\n]/gm, '' ) // strip leading and trailing lines/spaces
		.replace( /^#+|^={2,}|^-{2,}/gm, '' ); //strip common, noisy markdown stuff

	const firstLineEnd = data.indexOf( '\n' );

	if ( firstLineEnd === -1 ) {
		//this must be an empty file
		return {};
	}

	const title = data.slice( 0, firstLineEnd );
	const body = data.slice( firstLineEnd + 1 );

	return {
		path,
		content,
		title,
		body,
	};
}

main();

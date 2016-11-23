/**
 * External dependencies
 */
import request from 'superagent';

function fetchDocsEndpoint( endpoint, params, callback ) {
	request.
		get( '/devdocs/service/' + endpoint ).
		query( params ).
		end( function( error, res ) {
			if ( res.ok ) {
				callback( null, ( res.body || res.text ) ); // this conditional is to capture both JSON and text/html responses
			} else {
				callback( 'Error invoking /devdocs/' + endpoint + ': ' + res.text, null );
			}
		} );
}

/**
 * This service allows you to retrieve a document list (with title, snippets and path) based on
 * query term or filename(s), and also to separately retrieve the document body by path.
 */
module.exports = {
	search: function( term, callback ) {
		fetchDocsEndpoint( 'search', { q: term }, callback );
	},

	list: function( filenames, callback ) {
		fetchDocsEndpoint( 'list', { files: filenames.join( ',' ) }, callback );
	},

	fetch: function( path, callback ) {
		fetchDocsEndpoint( 'content', { path: path }, callback );
	},

	readme: function( component, callback ) {
		fetchDocsEndpoint( 'content', { component }, callback );
	}
};

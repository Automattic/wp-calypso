/**
 * Module dependencies.
 */
var debug = require( 'debug' )( 'calypso:wpcom-undocumented:user-suggestions' );

/**
 * Create an UndocumentedUserSuggestions instance
 *
 * @param {WPCOM} wpcom
 */

function UndocumentedUserSuggestions( wpcom ) {
	if ( ! ( this instanceof UndocumentedUserSuggestions ) ) {
		return new UndocumentedUserSuggestions( wpcom );
	}

	this.wpcom = wpcom;
}

UndocumentedUserSuggestions.prototype.get = function( query, fn ) {
	var path = '/users/suggest';

	debug( path, query, 'query' );

	this.wpcom.req.get( { path: path, apiVersion: '1' }, query, fn );
}

module.exports = UndocumentedUserSuggestions;

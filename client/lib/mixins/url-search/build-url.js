/**
 * External dependencies
 */
var url = require( 'url' ),
	pick = require( 'lodash/pick' );

/**
 * Given a URL or path and search terms, returns a path including the search
 * query parameter and preserving existing parameters.
 *
 * @param  {string} uri    URL or path to modify
 * @param  {string} search Search terms
 * @return {string}        Path including search terms
 */
module.exports = function( uri, search ) {
	var parsedUrl = url.parse( uri, true );

	if ( search ) {
		parsedUrl.query.s = search;
	} else {
		delete parsedUrl.query.s;
	}

	parsedUrl = pick( parsedUrl, 'pathname', 'hash', 'query' );
	return url.format( parsedUrl ).replace( /\%20/g, '+' );
};

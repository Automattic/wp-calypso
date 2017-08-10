/** @format */
var untrailingslashit = require( './untrailingslashit' ),
	page = require( 'page' );

function appendQueryString( basepath, querystring ) {
	return basepath + ( querystring ? '?' + querystring : '' );
}

module.exports = function normalize( context, next ) {
	var normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
};

/**
 * Internal dependencies
 */
import untrailingslashit from './untrailingslashit';
import page from 'page';

function appendQueryString( basepath, querystring ) {
	return basepath + ( querystring ? '?' + querystring : '' );
}

module.exports = function normalize( context, next ) {
	const normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
};

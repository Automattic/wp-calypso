/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import untrailingslashit from './untrailingslashit';

const appendQueryString = ( basepath: string, querystring: string ): string =>
	basepath + ( querystring ? '?' + querystring : '' );

const normalize: PageJS.Callback = ( context, next ) => {
	const normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
};

export default normalize;

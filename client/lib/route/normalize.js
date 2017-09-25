import untrailingslashit from './untrailingslashit';
import page from 'page';

function appendQueryString( basepath, querystring ) {
	return basepath + ( querystring ? '?' + querystring : '' );
}

export default function normalize( context, next ) {
	const normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
}

/**
 * External dependencies
 */
import page from 'page';
import { Primitive } from 'utility-types';

export * from './path';

const appendQueryString = ( basepath: string, querystring: string ): string =>
	basepath + ( querystring ? '?' + querystring : '' );

interface QueryArgs {
	[ key: string ]: Primitive;
}

export const trailingslashit = ( path: string ): string => path.replace( /(\/)?$/, '/' );

export const untrailingslashit = ( path: string ): string =>
	path === '/' ? path : path.replace( /\/$/, '' );

export const normalize: PageJS.Callback = ( context, next ) => {
	const normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
};

export function redirect( path: string ): void {
	if ( process.env.NODE_ENV === 'development' ) {
		throw 'route.redirect() is deprecated, use page.redirect()';
	}

	// Have to wrap the page.replace call in a defer due to
	// https://github.com/visionmedia/page.js/issues/50
	setTimeout( function() {
		page.replace( path );
	}, 0 );
}

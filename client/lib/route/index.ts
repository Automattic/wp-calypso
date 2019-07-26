/**
 * External dependencies
 */
import page from 'page';
import urlModule from 'url';
import { pickBy } from 'lodash';
import { Primitive } from 'utility-types';

export * from './path';

const appendQueryString = ( basepath: string, querystring: string ): string =>
	basepath + ( querystring ? '?' + querystring : '' );

interface QueryArgs {
	[key: string]: Primitive;
}
export const addQueryArgs = ( args: QueryArgs, url: URL ): URL => {
	if ( 'object' !== typeof args ) {
		throw new Error( 'addQueryArgs expects the first argument to be an object.' );
	}

	if ( 'string' !== typeof url ) {
		throw new Error( 'addQueryArgs expects the second argument to be a string.' );
	}

	// Remove any undefined query args
	args = pickBy( args, arg => arg != null );

	// Build new query object for url
	const parsedUrl = urlModule.parse( url, true );
	let query = parsedUrl.query || {};
	query = Object.assign( query, args );

	// Build new url object
	//
	// Note: we set search to false here to that our query object is processed
	const updatedUrlObject = Object.assign( parsedUrl, {
		query,
		search: false,
	} );

	return urlModule.format( updatedUrlObject );
};

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

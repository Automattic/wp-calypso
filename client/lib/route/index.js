/** @format */
/**
 * External dependencies
 */
import page from 'page';
import urlModule from 'url';
import { pickBy } from 'lodash';

// @TODO: change once we stop compiling to CommonJS
// export * from './path';
export {
	addSiteFragment,
	externalRedirect,
	getSiteFragment,
	getStatsDefaultSitePage,
	getStatsPathForTab,
	mapPostStatus,
	sectionify,
	sectionifyWithRoutes,
} from './path';

const appendQueryString = ( basepath, querystring ) =>
	basepath + ( querystring ? '?' + querystring : '' );

export const addQueryArgs = ( args, url ) => {
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

export const trailingslashit = path => path.replace( /(\/)?$/, '/' );

export const untrailingslashit = path => ( path === '/' ? path : path.replace( /\/$/, '' ) );

export const normalize = ( context, next ) => {
	const normalizedPathName = untrailingslashit( context.pathname );
	if ( normalizedPathName !== context.pathname ) {
		page.redirect( appendQueryString( normalizedPathName, context.querystring ) );
	} else {
		next();
	}
};

export function redirect( path ) {
	if ( process.env.NODE_ENV === 'development' ) {
		throw 'route.redirect() is deprecated, use page.redirect()';
	}

	// Have to wrap the page.replace call in a defer due to
	// https://github.com/visionmedia/page.js/issues/50
	setTimeout( function() {
		page.replace( path );
	}, 0 );
}

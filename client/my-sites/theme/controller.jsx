/**
 * External Dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import ThemeSheetComponent from './main';
import {
	receiveThemeDetails,
	receiveThemeDetailsFailure,
	setBackPath
} from 'state/themes/actions';
import wpcom from 'lib/wp';
import config from 'config';

const debug = debugFactory( 'calypso:themes' );
const themeDetailsCache = new Map();

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) || ! context.isServerSide ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = themeDetailsCache.get( themeSlug );

	const HOUR_IN_MS = 3600000;
	if ( theme && ( theme.timestamp + HOUR_IN_MS > Date.now() ) ) {
		debug( 'found theme!', theme.id );
		context.store.dispatch( receiveThemeDetails( theme ) );
		context.renderCacheKey = context.path + theme.timestamp;
		return next();
	}

	wpcom.undocumented().themeDetails( themeSlug )
		.then( themeDetails => {
			debug( 'caching', themeSlug );
			themeDetails.timestamp = Date.now();
			themeDetailsCache.set( themeSlug, themeDetails );
			context.store.dispatch( receiveThemeDetails( themeDetails ) );
			context.renderCacheKey = context.path + themeDetails.timestamp;
			next();
		} )
		.catch( error => {
			debug( `Error fetching theme ${ themeSlug } details: `, error.message || error );
			context.store.dispatch( receiveThemeDetailsFailure( themeSlug, error ) );
			context.renderCacheKey = 'theme not found';
			next();
		} );
}

export function details( context, next ) {
	const { slug, section } = context.params;
	if ( startsWith( context.prevPath, '/design' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <ThemeSheetComponent id={ slug }
		section={ section } />;
	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	next();
}

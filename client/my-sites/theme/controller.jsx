/**
 * External Dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import Lru from 'lru';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import ThemeSheetComponent from './main';
import {
	receiveTheme,
	themeRequestFailure,
	setBackPath
} from 'state/themes/actions';
import wpcom from 'lib/wp';
import config from 'config';

const debug = debugFactory( 'calypso:themes' );
const HOUR_IN_MS = 3600000;
const themeDetailsCache = new Lru( {
	max: 500,
	maxAge: HOUR_IN_MS
} );

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) || ! context.isServerSide ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = themeDetailsCache.get( themeSlug );

	if ( theme ) {
		debug( 'found theme!', theme.id );
		context.store.dispatch( receiveTheme( theme, 'wpcom' ) );
		context.renderCacheKey = context.path + theme.timestamp;
		return next();
	}

	wpcom.undocumented().themeDetails( themeSlug )
		.then( themeDetails => {
			debug( 'caching', themeSlug );
			themeDetails.timestamp = Date.now();
			themeDetailsCache.set( themeSlug, themeDetails );
			context.store.dispatch( receiveTheme( themeDetails, 'wpcom' ) );
			context.renderCacheKey = context.path + themeDetails.timestamp;
			next();
		} )
		.catch( error => {
			debug( `Error fetching theme ${ themeSlug } details: `, error.message || error );
			context.store.dispatch( themeRequestFailure( 'wpcom', themeSlug, error ) );
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

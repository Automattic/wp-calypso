/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import debugFactory from 'debug';
import Lru from 'lru';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import ThemeSheetComponent from './main';
import ThemeNotFoundError from './theme-not-found-error';
import LayoutLoggedOut from 'layout/logged-out';
import {
	receiveTheme,
	requestTheme,
	setBackPath
} from 'state/themes/actions';
import { getTheme, getThemeRequestErrors } from 'state/themes/selectors';
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

	context.store.dispatch( requestTheme( themeSlug, 'wpcom' ) )
		.then( () => {
			const themeDetails = getTheme( context.store.getState(), 'wpcom', themeSlug );
			if ( ! themeDetails ) {
				const error = getThemeRequestErrors( context.store.getState(), themeSlug, 'wpcom' );
				debug( `Error fetching theme ${ themeSlug } details: `, error.message || error );
				context.renderCacheKey = 'theme not found';
				const err = {
					status: 404,
					message: 'Theme Not Found',
					themeSlug
				};
				return next( err );
			}
			debug( 'caching', themeSlug );
			themeDetails.timestamp = Date.now();
			context.renderCacheKey = context.path + themeDetails.timestamp;
			themeDetailsCache.set( themeSlug, themeDetails );
			next();
		} )
		.catch( next );
}

export function details( context, next ) {
	const { slug, section } = context.params;
	if ( startsWith( context.prevPath, '/themes' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <ThemeSheetComponent id={ slug }
		section={ section } />;
	context.secondary = null; // When we're logged in, we need to remove the sidebar.
	next();
}

export function notFoundError( err, context, next ) {
	context.layout = (
		<ReduxProvider store={ context.store }>
			<LayoutLoggedOut primary={ <ThemeNotFoundError /> } />
		</ReduxProvider>
	);
	next( err );
}

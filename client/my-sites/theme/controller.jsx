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
	requestTheme,
	setBackPath
} from 'state/themes/actions';
import { getTheme } from 'state/themes/selectors';
import config from 'config';

const debug = debugFactory( 'calypso:themes' );

export function fetchThemeDetailsData( context, next ) {
	if ( ! config.isEnabled( 'manage/themes/details' ) || ! context.isServerSide ) {
		return next();
	}

	const themeSlug = context.params.slug;
	const theme = getTheme( context.store.getState(), themeSlug );

	if ( theme ) {
		debug( 'found theme in cache!', theme.id );
		return next();
	}

	context.store.dispatch( requestTheme( themeSlug, 'wpcom' ) ).then( next );
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

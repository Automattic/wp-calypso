/**
 * External dependencies
 */
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal Dependencies
 */
import LoggedOutComponent from './logged-out';
import trackScrollPage from 'calypso/lib/track-scroll-page';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { requestThemes, requestThemeFilters } from 'calypso/state/themes/actions';
import { getThemeFilters, getThemesForQuery } from 'calypso/state/themes/selectors';
import { getAnalyticsData } from './helpers';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:themes' );

export function getProps( context ) {
	const { tier, filter, vertical } = context.params;

	const { analyticsPath, analyticsPageTitle } = getAnalyticsData( context.path, context.params );

	const boundTrackScrollPage = function () {
		trackScrollPage( analyticsPath, analyticsPageTitle, 'Themes' );
	};

	return {
		tier,
		filter,
		vertical,
		analyticsPageTitle,
		analyticsPath,
		search: context.query.s,
		pathName: context.pathname,
		trackScrollPage: boundTrackScrollPage,
	};
}

export function loggedOut( context, next ) {
	if ( context.isServerSide && Object.keys( context.query ).length > 0 ) {
		// Don't server-render URLs with query params
		return next();
	}

	// If logged in, do nothing:
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );
	if ( currentUser ) {
		return next();
	}

	const props = getProps( context );

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}

export function fetchThemeData( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const siteId = 'wpcom';
	const query = {
		search: context.query.s,
		tier: context.params.tier,
		filter: [ context.params.filter, context.params.vertical ].filter( Boolean ).join( ',' ),
		page: 1,
		number: DEFAULT_THEME_QUERY.number,
	};

	const themes = getThemesForQuery( context.store.getState(), siteId, query );
	if ( themes ) {
		debug( 'found theme data in cache' );
		return next();
	}

	context.store.dispatch( requestThemes( siteId, query ) ).then( next ).catch( next );
}

export function fetchThemeFilters( context, next ) {
	const { store } = context;

	if ( Object.keys( getThemeFilters( store.getState() ) ).length > 0 ) {
		debug( 'found theme filters in cache' );
		return next();
	}

	const unsubscribe = store.subscribe( () => {
		if ( Object.keys( getThemeFilters( store.getState() ) ).length > 0 ) {
			unsubscribe();
			return next();
		}
	} );
	store.dispatch( requestThemeFilters() );
}

// Legacy (Atlas-based Theme Showcase v4) route redirects

export function redirectSearchAndType( { res, params: { site, search, tier } } ) {
	const target = '/themes/' + [ tier, site ].filter( Boolean ).join( '/' ); // tier before site!
	if ( search ) {
		res.redirect( `${ target }?s=${ search }` );
	} else {
		res.redirect( target );
	}
}

export function redirectFilterAndType( { res, params: { site, filter, tier } } ) {
	let parts;
	if ( filter ) {
		parts = [ tier, 'filter', filter, site ];
	} else {
		parts = [ tier, site ];
	}
	res.redirect( '/themes/' + parts.filter( Boolean ).join( '/' ) );
}

export function redirectToThemeDetails( { res, params: { site, theme, section } }, next ) {
	// Make sure we aren't matching a site -- e.g. /themes/example.wordpress.com or /themes/1234567
	if ( theme.includes( '.' ) || Number.isInteger( parseInt( theme, 10 ) ) ) {
		return next();
	}
	let redirectedSection;
	if ( section === 'support' ) {
		redirectedSection = 'setup';
	}
	res.redirect( '/theme/' + [ theme, redirectedSection, site ].filter( Boolean ).join( '/' ) );
}

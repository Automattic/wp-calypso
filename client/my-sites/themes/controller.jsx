/**
 * External dependencies
 */
import { compact, includes, isEmpty, startsWith } from 'lodash';
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from './logged-out';
import Upload from 'my-sites/themes/theme-upload';
import trackScrollPage from 'lib/track-scroll-page';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';
import { requestThemes, requestThemeFilters, setBackPath } from 'state/themes/actions';
import { getThemeFilters, getThemesForQuery } from 'state/themes/selectors';
import { getAnalyticsData } from './helpers';

const debug = debugFactory( 'calypso:themes' );

function getProps( context ) {
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

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if (
		startsWith( context.prevPath, '/themes' ) &&
		! startsWith( context.prevPath, '/themes/upload' )
	) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <Upload />;
	next();
}

export function loggedIn( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	const Component = context.params.site_id ? SingleSiteComponent : MultiSiteComponent;
	context.primary = <Component { ...getProps( context ) } />;

	next();
}

export function loggedOut( context, next ) {
	if ( context.isServerSide && ! isEmpty( context.query ) ) {
		// Don't server-render URLs with query params
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
		filter: compact( [ context.params.filter, context.params.vertical ] ).join( ',' ),
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

	if ( ! isEmpty( getThemeFilters( store.getState() ) ) ) {
		debug( 'found theme filters in cache' );
		return next();
	}

	const unsubscribe = store.subscribe( () => {
		if ( ! isEmpty( getThemeFilters( store.getState() ) ) ) {
			unsubscribe();
			return next();
		}
	} );
	store.dispatch( requestThemeFilters() );
}

// Legacy (Atlas-based Theme Showcase v4) route redirects

export function redirectSearchAndType( { res, params: { site, search, tier } } ) {
	const target = '/themes/' + compact( [ tier, site ] ).join( '/' ); // tier before site!
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
	res.redirect( '/themes/' + compact( parts ).join( '/' ) );
}

export function redirectToThemeDetails( { res, params: { site, theme, section } }, next ) {
	// Make sure we aren't matching a site -- e.g. /themes/example.wordpress.com or /themes/1234567
	if ( includes( theme, '.' ) || isFinite( theme ) ) {
		return next();
	}
	let redirectedSection;
	if ( section === 'support' ) {
		redirectedSection = 'setup';
	}
	res.redirect( '/theme/' + compact( [ theme, redirectedSection, site ] ).join( '/' ) );
}

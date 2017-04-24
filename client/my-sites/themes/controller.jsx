/**
 * External Dependencies
 */
import { compact, includes, isEmpty, startsWith } from 'lodash';
import debugFactory from 'debug';
import Lru from 'lru';
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
import { requestThemes, requestThemeFilters, receiveThemes, setBackPath } from 'state/themes/actions';
import { getThemesForQuery, getThemesFoundForQuery } from 'state/themes/selectors';
import { getAnalyticsData } from './helpers';
import { getThemeFilters } from 'state/selectors';

const debug = debugFactory( 'calypso:themes' );
const HOUR_IN_MS = 3600000;
const themesQueryCache = new Lru( {
	max: 500,
	maxAge: HOUR_IN_MS
} );

function getProps( context ) {
	const { tier, filter, vertical, site_id: siteId } = context.params;

	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);

	const boundTrackScrollPage = function() {
		trackScrollPage(
			basePath,
			analyticsPageTitle,
			'Themes'
		);
	};

	return {
		tier,
		filter,
		vertical,
		analyticsPageTitle,
		analyticsPath: basePath,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage
	};
}

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if ( startsWith( context.prevPath, '/themes' ) &&
		! startsWith( context.prevPath, '/themes/upload' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <Upload />;
	next();
}

export function singleSite( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...getProps( context ) } />;
	next();
}

export function multiSite( context, next ) {
	const props = getProps( context );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <MultiSiteComponent { ...props } />;
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

	if ( ! isEmpty( context.query ) ) {
		// Don't server-render URLs with query params
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
	// context.pathname includes tier, filter, and verticals, but not the query string, so it's a suitable cacheKey
	// However, we can't guarantee it's normalized -- filters can be in any order, resulting in multiple possible cacheKeys for
	// the same sets of results.
	const cacheKey = context.pathname;

	const cachedData = themesQueryCache.get( cacheKey );
	if ( cachedData ) {
		debug( `found theme data in cache key=${ cacheKey }` );
		context.store.dispatch( receiveThemes( cachedData.themes, siteId, query, cachedData.found ) );
		context.renderCacheKey = cacheKey + cachedData.timestamp;
		return next();
	}

	context.store.dispatch( requestThemes( siteId, query ) )
		.then( () => {
			const themes = getThemesForQuery( context.store.getState(), siteId, query );
			const found = getThemesFoundForQuery( context.store.getState(), siteId, query );
			const timestamp = Date.now();
			themesQueryCache.set( cacheKey, { themes, found, timestamp } );
			context.renderCacheKey = cacheKey + timestamp;
			debug( `caching theme data key=${ cacheKey }` );
			next();
		} )
		.catch( () => next() );
}

export function fetchThemeFilters( context, next ) {
	const { store } = context;

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

export function redirectSearchAndType( { res, params: { site, search, tier } } ) {
	const target = '/themes/' + compact( [ tier, site ] ).join( '/' ); // tier before site!
	if ( search ) {
		res.redirect( `${ target }?s=${ search }` );
	} else {
		res.redirect( target );
	}
}

export function redirectFilterAndType( { res, params: { site, filter, tier } } ) {
	let parts;
	if ( filter ) {
		parts = [ tier, 'filter', filter.replace( '+', ',' ), site ]; // The Atlas Showcase used plusses, we use commas
	} else {
		parts = [ tier, site ];
	}
	res.redirect( '/themes/' + compact( parts ).join( '/' ) );
}

export function redirectToThemeDetails( { res, params: { site, theme, section } }, next ) {
	// Make sure we aren't matching a site -- e.g. /themes/example.wordpress.com or /themes/1234567
	if ( includes( theme, '.' ) || isFinite( theme ) ) {
		return next();
	}
	let redirectedSection;
	if ( section === 'support' ) {
		redirectedSection = 'setup';
	}
	res.redirect( '/theme/' + compact( [ theme, redirectedSection, site ] ).join( '/' ) );
}

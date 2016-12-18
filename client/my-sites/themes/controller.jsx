/**
 * External Dependencies
 */
import compact from 'lodash/compact';
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
import { requestThemes, receiveThemes } from 'state/themes/actions';
import { getThemesForQuery } from 'state/themes/selectors';
import { getAnalyticsData } from './helpers';

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
	const props = getProps( context );

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}

export function fetchThemeData( context, next, shouldUseCache = false ) {
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
	const cacheKey = context.path;

	if ( shouldUseCache ) {
		const cachedData = themesQueryCache.get( cacheKey );
		if ( cachedData ) {
			debug( `found theme data in cache key=${ cacheKey }` );
			context.store.dispatch( receiveThemes( cachedData.themes ), siteId );
			context.renderCacheKey = context.path + cachedData.timestamp;
			return next();
		}
	}

	context.store.dispatch( requestThemes( siteId, query ) )
		.then( () => {
			if ( shouldUseCache ) {
				const themes = getThemesForQuery( context.store.getState(), siteId, query );
				const timestamp = Date.now();
				themesQueryCache.set( cacheKey, { themes, timestamp } );
				context.renderCacheKey = context.path + timestamp;
				debug( `caching theme data key=${ cacheKey }` );
			}
			next();
		} )
		.catch( () => next() );
}

export function fetchThemeDataWithCaching( context, next ) {
	if ( Object.keys( context.query ).length > 0 ) {
		// Don't cache URLs with query params for now
		return fetchThemeData( context, next, false );
	}

	return fetchThemeData( context, next, true );
}

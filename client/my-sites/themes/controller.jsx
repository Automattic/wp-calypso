/**
 * External Dependencies
 */
import compact from 'lodash/compact';
import debugFactory from 'debug';
import Lru from 'lru-cache';
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from './logged-out';
import trackScrollPage from 'lib/track-scroll-page';
import { PER_PAGE } from 'state/themes/themes-list/constants';
import {
	fetchThemes,
	incrementThemesPage,
	query
} from 'state/themes/actions';
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

export function singleSite( context, next ) {
	const { site_id: siteId } = context.params;
	const props = getProps( context );

	props.key = siteId;
	props.siteId = siteId;

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...props } />;
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

	const queryParams = {
		search: context.query.s,
		tier: context.params.tier,
		filter: compact( [ context.params.filter, context.params.vertical ] ).join( ',' ),
		page: 0,
		perPage: PER_PAGE,
	};
	const cacheKey = context.path;

	context.store.dispatch( query( queryParams ) );
	context.store.dispatch( incrementThemesPage( false ) );

	if ( shouldUseCache ) {
		const cachedAction = themesQueryCache.get( cacheKey );
		if ( cachedAction ) {
			debug( `found theme data in cache key=${ cacheKey }` );
			context.store.dispatch( cachedAction );
			return next();
		}
	}

	context.store.dispatch( fetchThemes( false ) )
		.then( action => {
			if ( shouldUseCache ) {
				const timestamp = Date.now();
				themesQueryCache.set( cacheKey, action );
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

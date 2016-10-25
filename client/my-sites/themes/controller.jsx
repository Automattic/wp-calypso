/**
 * External Dependencies
 */
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from './logged-out';
import trackScrollPage from 'lib/track-scroll-page';
import { PER_PAGE } from 'state/themes/themes-list/constants';
import { getQueryParams } from 'state/themes/themes-list/selectors';
import wpcom from 'lib/wp';
import {
	incrementThemesPage,
	query,
	receiveThemes,
	receiveServerError
} from 'state/themes/actions';
import {
	getAnalyticsData,
	generateCacheKey
} from './helpers';

const debug = debugFactory( 'calypso:themes' );
const themesQueryCache = new Map();

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

export function fetchThemeData( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const userQueryParams = {
		search: context.query.s,
		tier: context.params.tier,
		filter: context.params.filter,
		page: 0,
		perPage: PER_PAGE,
	};
	const queryKey = generateCacheKey( userQueryParams );
	const queryResults = themesQueryCache.get( queryKey );
	const startTime = new Date().getTime();
	const HOUR_IN_MS = 3600000;

	context.store.dispatch( query( userQueryParams ) );
	context.store.dispatch( incrementThemesPage( false ) );

	const stateQueryParams = getQueryParams( context.store.getState() );
	if ( queryResults && ( queryResults.timestamp + HOUR_IN_MS > Date.now() ) ) {
		debug( 'found themes!', queryKey );
		context.store.dispatch( receiveThemes(
			queryResults.themes,
			queryResults.site,
			queryResults.queryParams,
			queryResults.responseTime
		) );
		return next();
	}

	wpcom.undocumented().themes( false, stateQueryParams )
		.then( themes => {
			const timestamp = Date.now();
			const responseTime = timestamp - startTime;

			debug( 'caching', queryKey, JSON.stringify( themes ) );
			themesQueryCache.set( queryKey, {
				themes,
				queryParams: stateQueryParams,
				responseTime,
				timestamp,
				site: false
			} );

			context.renderCacheKey = context.path + timestamp;
			context.store.dispatch( receiveThemes( themes, false, stateQueryParams, responseTime ) );
			next();
		} )
		.catch( error => {
			debug( `Error fetching theme showcase for ${ JSON.stringify( userQueryParams ) } details: `, error.message || error );
			context.store.dispatch( receiveServerError( error ) );
			context.renderCacheKey = 'themes not found';
			next();
		} );
}

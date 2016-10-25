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
import {
	fetchThemes,
	incrementThemesPage,
	query
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

	const queryParams = {
		search: context.query.s,
		tier: context.params.tier,
		filter: context.params.filter,
		page: 0,
		perPage: PER_PAGE,
	};
	const queryKey = generateCacheKey( queryParams );
	const cachedResponse = themesQueryCache.get( queryKey );
	const HOUR_IN_MS = 3600000;

	context.store.dispatch( query( queryParams ) );
	context.store.dispatch( incrementThemesPage( false ) );

	if ( cachedResponse && ( cachedResponse.timestamp + HOUR_IN_MS > Date.now() ) ) {
		debug( 'found themes!', queryKey );
		context.store.dispatch( cachedResponse.action );
		return next();
	}

	context.store.dispatch( fetchThemes( false ) )
		.then( action => {
			// Fetch and dispatch is done — cache the action so it can be re-dispatched later
			const timestamp = Date.now();
			themesQueryCache.set( queryKey, {
				action,
				timestamp
			} );
			context.renderCacheKey = context.path + timestamp;
			next();
		} )
		.catch( () => next() );
}

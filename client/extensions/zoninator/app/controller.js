/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { getSiteFragment, sectionify } from 'lib/route';
import Settings from '../components/settings';

export const renderTab = component => ( context, next ) => {
	const siteId = getSiteFragment( context.path );
	const zoneId = parseInt( context.params.zone, 10 ) || 0;

	let baseAnalyticsPath = sectionify( context.path );

	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}

	if ( zoneId ) {
		baseAnalyticsPath += '/:zone';
	}

	let analyticsPageTitle = 'WP Zone Manager';

	if ( zoneId ) {
		analyticsPageTitle += ' > Edit zone';
	}

	if ( baseAnalyticsPath.match( /.*\/new\/:site$/ ) ) {
		analyticsPageTitle += ' > New Zone';
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	context.primary = <Settings>{ React.createElement( component, { zoneId } ) }</Settings>;
	next();
};

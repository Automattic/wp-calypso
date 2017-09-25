/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Settings from '../components/settings';
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getSiteFragment, sectionify } from 'lib/route';

export const renderTab = ( component ) => ( context ) => {
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

	renderWithReduxStore(
		<Settings>
			{ React.createElement( component, { zoneId } ) }
		</Settings>,
		document.getElementById( 'primary' ),
		context.store,
	);
};

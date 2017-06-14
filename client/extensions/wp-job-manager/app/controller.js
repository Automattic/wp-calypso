/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { getSiteFragment, sectionify } from 'lib/route';
import { renderWithReduxStore } from 'lib/react-helpers';
import WPJobManager from './main';

export function renderTab( context, component, tab = '' ) {
	const siteId = getSiteFragment( context.path );
	const basePath = sectionify( context.path );
	let baseAnalyticsPath;

	if ( siteId ) {
		baseAnalyticsPath = `${ basePath }/:site`;
	} else {
		baseAnalyticsPath = basePath;
	}

	let analyticsPageTitle = 'WP Job Manager';

	if ( tab.length ) {
		analyticsPageTitle += ` > ${ titlecase( tab ) }`;
	} else {
		analyticsPageTitle += ' > Job Listings';
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	renderWithReduxStore(
		React.createElement(
			WPJobManager,
			{ context, tab },
			React.createElement( component ),
		),
		document.getElementById( 'primary' ),
		context.store
	);
}

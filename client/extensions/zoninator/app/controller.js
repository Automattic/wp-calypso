/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { getSiteFragment, sectionify } from 'lib/route';
import { renderWithReduxStore } from 'lib/react-helpers';
import Settings from '../components/settings';

export const renderTab = ( component ) => ( context ) => {
	const siteId = getSiteFragment( context.path );
	const { zone = '' } = context.params;

	let baseAnalyticsPath = sectionify( context.path );

	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}

	let analyticsPageTitle = 'WP Zone Manager';

	if ( zone.length ) {
		analyticsPageTitle += ` > ${ titlecase( zone ) }`;
	} else {
		analyticsPageTitle += ' > New Zone';
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	renderWithReduxStore(
		<Settings tab={ zone }>
			{ React.createElement( component ) }
		</Settings>,
		document.getElementById( 'primary' ),
		context.store
	);
};

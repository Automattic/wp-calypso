/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { getSiteFragment, sectionify } from 'lib/route';
import Settings from '../components/settings';
import SetupWizard from '../components/setup';

export const renderTab = ( component, tab = '' ) => ( context, next ) => {
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

	context.primary = <Settings tab={ tab }>{ React.createElement( component ) }</Settings>;
	next();
};

export const renderSetupWizard = ( context, next ) => {
	const stepName = get( context, [ 'params', 'stepName' ] );

	context.primary = <SetupWizard stepName={ stepName } />;
	next();
};

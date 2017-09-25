/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import Settings from '../components/settings';
import SetupWizard from '../components/setup';
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getSiteFragment, sectionify } from 'lib/route';

export const renderTab = ( component, tab = '' ) => ( context ) => {
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
		<Settings tab={ tab }>
			{ React.createElement( component ) }
		</Settings>,
		document.getElementById( 'primary' ),
		context.store
	);
};

export const renderSetupWizard = context => {
	const stepName = get( context, [ 'params', 'stepName' ] );

	renderWithReduxStore(
		<SetupWizard stepName={ stepName } />,
		document.getElementById( 'primary' ),
		context.store
	);
};

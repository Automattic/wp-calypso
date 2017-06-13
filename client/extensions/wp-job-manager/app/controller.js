/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { getSiteFragment, sectionify } from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import WPJobManager from './main';

export function settings( context ) {
	const siteId = getSiteFragment( context.path );
	const { tab = '' } = context.params;

	context.store.dispatch( setTitle( i18n.translate( 'WP Job Manager', { textOnly: true } ) ) );

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
		React.createElement( WPJobManager, { context, tab } ),
		document.getElementById( 'primary' ),
		context.store
	);
}

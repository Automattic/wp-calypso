/** @format */

/**
 * External dependencies
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
import WPSuperCache from './main';

export function settings( context, next ) {
	const siteId = getSiteFragment( context.path );
	const { tab = '' } = context.params;

	context.store.dispatch( setTitle( i18n.translate( 'WP Super Cache', { textOnly: true } ) ) );

	const basePath = sectionify( context.path );
	let baseAnalyticsPath;

	if ( siteId ) {
		baseAnalyticsPath = `${ basePath }/:site`;
	} else {
		baseAnalyticsPath = basePath;
	}

	let analyticsPageTitle = 'WP Super Cache';

	if ( tab.length ) {
		analyticsPageTitle += ` > ${ titlecase( tab ) }`;
	} else {
		analyticsPageTitle += ' > Easy';
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	context.primary = <WPSuperCache tab={ tab } />;
	next();
}

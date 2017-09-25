/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import WPSuperCache from './main';
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getSiteFragment, sectionify } from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

export function settings( context ) {
	const siteId = getSiteFragment( context.path );
	const { tab = '' } = context.params;

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

	renderWithReduxStore(
		<WPSuperCache tab={ tab } />,
		document.getElementById( 'primary' ),
		context.store
	);
}

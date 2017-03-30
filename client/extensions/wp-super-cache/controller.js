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
import { getSelectedSite } from 'state/ui/selectors';
import WPSuperCache from './main';

const controller = {

	settings: function(context, next) {
	    const siteId = getSiteFragment( context.path );
		const site = getSelectedSite( context.store.getState() );
		let tab = context.params.tab;

		tab = ( ! tab || tab === siteId ) ? '' : tab;
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

		context.primary = React.createElement( WPSuperCache, {
			context,
			site,
			tab,
		} );
		next();
	}
};

module.exports = controller;

/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import route from 'client/lib/route';
import analytics from 'client/lib/analytics';
import titlecase from 'to-title-case';
import trackScrollPage from 'client/lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'client/state/document-head/actions';

const controller = {
	pages: function( context, next ) {
		var Pages = require( 'my-sites/pages/main' ),
			siteID = route.getSiteFragment( context.path ),
			status = context.params.status,
			search = context.query.s,
			basePath = route.sectionify( context.path ),
			analyticsPageTitle = 'Pages',
			baseAnalyticsPath;

		status = ! status || status === siteID ? '' : status;
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Site Pages', { textOnly: true } ) ) );

		if ( siteID ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		if ( status.length ) {
			analyticsPageTitle += ' > ' + titlecase( status );
		} else {
			analyticsPageTitle += ' > Published';
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

		context.primary = React.createElement( Pages, {
			siteID: siteID,
			status: status,
			search: search,
			trackScrollPage: trackScrollPage.bind( null, baseAnalyticsPath, analyticsPageTitle, 'Pages' ),
		} );
		next();
	},
};

export default controller;

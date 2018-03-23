/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSiteFragment } from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import Pages from 'my-sites/pages/main';

const controller = {
	pages: function( context, next ) {
		const siteID = getSiteFragment( context.path );
		let status = context.params.status;
		const search = context.query.s;
		let analyticsPageTitle = 'Pages';
		let baseAnalyticsPath;

		status = ! status || status === siteID ? '' : status;
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Site Pages', { textOnly: true } ) ) );

		if ( siteID ) {
			baseAnalyticsPath = status ? `/pages/${ status }/:site` : '/pages/:site';
		} else {
			baseAnalyticsPath = status ? `/pages/${ status }` : '/pages';
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

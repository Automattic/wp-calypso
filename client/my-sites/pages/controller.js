/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import trackScrollPage from 'lib/track-scroll-page';
import Pages from 'my-sites/pages/main';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

const controller = {

	pages: function( context ) {
		let siteID = route.getSiteFragment( context.path ), status = context.params.status, search = context.query.s, basePath = route.sectionify( context.path ), analyticsPageTitle = 'Pages', baseAnalyticsPath;

		status = ( ! status || status === siteID ) ? '' : status;
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

		renderWithReduxStore(
			React.createElement( Pages, {
				siteID: siteID,
				status: status,
				search: search,
				trackScrollPage: trackScrollPage.bind(
					null,
					baseAnalyticsPath,
					analyticsPageTitle,
					'Pages'
				)
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

export default controller;

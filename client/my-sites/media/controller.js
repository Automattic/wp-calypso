/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { sectionify } from 'lib/route';
import analytics from 'lib/analytics';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getSelectedSite } from 'state/ui/selectors';
import MediaComponent from 'my-sites/media/main';

export default {
	media: function( context, next ) {
		const filter = context.params.filter;
		const search = context.query.s;
		let baseAnalyticsPath = sectionify( context.path );

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		// Analytics
		if ( selectedSite ) {
			baseAnalyticsPath += '/:site';
		}
		analytics.pageView.record( baseAnalyticsPath, 'Media' );

		// Page Title
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Media', { textOnly: true } ) ) );

		// Render
		context.primary = React.createElement( MediaComponent, {
			selectedSite,
			filter: filter,
			search: search,
		} );
		next();
	},
};

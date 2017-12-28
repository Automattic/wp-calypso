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
import { setDocumentHeadTitle as setTitle } from 'client/state/document-head/actions';
import { getSelectedSite } from 'client/state/ui/selectors';

export default {
	media: function( context, next ) {
		var MediaComponent = require( 'my-sites/media/main' ),
			filter = context.params.filter,
			search = context.query.s,
			baseAnalyticsPath = route.sectionify( context.path );

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

/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import analytics from 'lib/analytics';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getSelectedSite } from 'state/ui/selectors';

module.exports = {

	media: function( context ) {
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
		renderWithReduxStore(
			React.createElement( MediaComponent, {
				selectedSite,
				filter: filter,
				search: search
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}

};

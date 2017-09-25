/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import MediaComponent from 'my-sites/media/main';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getSelectedSite } from 'state/ui/selectors';

export default {

	media: function( context ) {
		let filter = context.params.filter, search = context.query.s, baseAnalyticsPath = route.sectionify( context.path );

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

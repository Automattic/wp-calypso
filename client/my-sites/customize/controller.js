/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */
import { sectionify } from 'lib/route/path';
import analytics from 'lib/analytics';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

export function customize( context ) {
	const CustomizeComponent = require( 'my-sites/customize/main' ),
		basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Customizer' );

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Customizer', { textOnly: true } ) ) );

	context.primary = React.createElement( ReduxProvider, { store: context.store },
		React.createElement( CustomizeComponent, {
			domain: context.params.domain || '',
			prevPath: context.prevPath || '',
			query: context.query,
			panel: context.params.panel
		} )
	);
}

// Redirect legacy `/menus` routes to the corresponding Customizer panel
export function redirectMenus( context ) {
	const siteSlug = get( context.params, 'site', '' );
	const newRoute = '/customize/menus/' + siteSlug;

	if ( context.isServerSide ) {
		return context.res.redirect( 301, newRoute );
	}
	page.redirect( newRoute );
}

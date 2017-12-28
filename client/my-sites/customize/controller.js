/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal Dependencies
 */
import { sectionify } from 'client/lib/route/path';
import analytics from 'client/lib/analytics';
import { setDocumentHeadTitle as setTitle } from 'client/state/document-head/actions';

export function customize( context, next ) {
	const CustomizeComponent = require( 'my-sites/customize/main' ),
		basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Customizer' );

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Customizer', { textOnly: true } ) ) );

	context.primary = React.createElement( CustomizeComponent, {
		domain: context.params.domain || '',
		pathname: context.pathname,
		prevPath: context.prevPath || '',
		query: context.query,
		panel: context.params.panel,
	} );

	next();
}

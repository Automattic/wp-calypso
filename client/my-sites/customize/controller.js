/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import CustomizeComponent from 'calypso/my-sites/customize/main';

export function customize( context, next ) {
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

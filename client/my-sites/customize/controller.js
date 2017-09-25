/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { sectionify } from 'lib/route/path';
import CustomizeComponent from 'my-sites/customize/main';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

export function customize( context ) {
	const basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Customizer' );

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Customizer', { textOnly: true } ) ) );

	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( CustomizeComponent, {
				domain: context.params.domain || '',
				pathname: context.pathname,
				prevPath: context.prevPath || '',
				query: context.query,
				panel: context.params.panel
			} )
		),
		document.getElementById( 'primary' )
	);
}

import i18n from 'i18n-calypso';
import { createElement } from 'react';
import CustomizeComponent from 'calypso/my-sites/customize/main';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';

export function customize( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Customizer', { textOnly: true } ) ) );

	context.primary = createElement( CustomizeComponent, {
		domain: context.params.domain || '',
		pathname: context.pathname,
		prevPath: context.prevPath || '',
		query: context.query,
		panel: context.params.panel,
	} );

	next();
}

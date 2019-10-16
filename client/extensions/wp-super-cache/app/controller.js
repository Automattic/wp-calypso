/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import WPSuperCache from './main';

export function settings( context, next ) {
	const { tab = '' } = context.params;

	context.store.dispatch( setTitle( translate( 'WP Super Cache', { textOnly: true } ) ) );

	context.primary = <WPSuperCache tab={ tab } />;
	next();
}

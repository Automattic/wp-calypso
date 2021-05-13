/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import WPSuperCache from './main';

export function settings( context, next ) {
	const { tab = '' } = context.params;

	context.store.dispatch( setTitle( i18n.translate( 'WP Super Cache', { textOnly: true } ) ) );

	context.primary = <WPSuperCache tab={ tab } />;
	next();
}

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupsPage from './main';
import { getSelectedSiteId } from 'state/ui/selectors';

export function jetpackBackups( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	context.primary = <BackupsPage siteId={ siteId } />;
	next();
}

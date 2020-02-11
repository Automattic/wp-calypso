/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ScanPage from './main';
import { getSelectedSiteId } from 'state/ui/selectors';

export function jetpackScan( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	context.primary = <ScanPage siteId={ siteId } />;
	next();
}

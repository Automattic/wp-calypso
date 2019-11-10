/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Hosting from './main';
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';

export function handleHostingPanelRedirect( context, next ) {
	const { store } = context;
	const state = store.getState();

	if ( canSiteViewAtomicHosting( state ) ) {
		next();
		return;
	}

	page.redirect( `/stats/day/${ context.params.siteId || '' }` );
}

export function layout( context, next ) {
	context.primary = React.createElement( Hosting );
	next();
}

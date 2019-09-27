/** @format */

/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import page from 'page';

/**
 * Internal Dependencies
 */
import Hosting from './main';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';

export function redirectIfNotAtomic( context, next ) {
	const { store } = context;
	const state = store.getState();
	const isAtomic = isSiteAutomatedTransfer( state, getSelectedSiteId( state ) );

	if ( ! config.isEnabled( 'hosting' ) || ! isAtomic ) {
		page.redirect( '/' );
	}

	next();
}

export function layout( context, next ) {
	context.primary = React.createElement( Hosting );

	next();
}

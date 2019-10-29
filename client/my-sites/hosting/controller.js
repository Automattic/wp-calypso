/** @format */

/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Hosting from './main';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { isBusinessPlan } from 'lib/plans';

export function handleHostingPanelRedirect( context, next ) {
	const { store } = context;
	const state = store.getState();
	const isAtomic = isSiteAutomatedTransfer( state, getSelectedSiteId( state ) );
	const isBusinessSite = isBusinessPlan( get( getSelectedSite( state ), 'plan.product_slug' ) );

	if (
		config.isEnabled( 'hosting' ) &&
		( isAtomic || ( config.isEnabled( 'hosting/non-atomic-support' ) && isBusinessSite ) )
	) {
		next();
		return;
	}

	page.redirect( '/' );
}

export function layout( context, next ) {
	context.primary = React.createElement( Hosting );
	next();
}

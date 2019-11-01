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
import { getSelectedSite } from 'state/ui/selectors';
import { isBusinessPlan } from 'lib/plans';
import isSiteEligibleForAtomicHosting from 'state/selectors/is-site-eligible-for-atomic-hosting';

export function handleHostingPanelRedirect( context, next ) {
	const { store } = context;
	const state = store.getState();
	const isBusinessSite = isBusinessPlan( get( getSelectedSite( state ), 'plan.product_slug' ) );
	const isEligible = isSiteEligibleForAtomicHosting( state );

	if (
		config.isEnabled( 'hosting' ) &&
		( isEligible || ( config.isEnabled( 'hosting/non-atomic-support' ) && isBusinessSite ) )
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

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
import { isBusinessPlan } from 'lib/plans';
import { getSelectedSite } from 'state/ui/selectors';

export function redirectIfNotBusiness( context, next ) {
	const { store } = context;
	const state = store.getState();
	const isBusinessSite = isBusinessPlan( get( getSelectedSite( state ), 'plan.product_slug' ) );

	if ( config.isEnabled( 'hosting' ) && isBusinessSite ) {
		next();
		return;
	}

	page.redirect( '/' );
}

export function layout( context, next ) {
	context.primary = React.createElement( Hosting );
	next();
}

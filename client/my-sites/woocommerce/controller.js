/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import main from './main';
import { getSiteFragment } from 'calypso/lib/route';
import {
	getSelectedSiteWithFallback,
	getSiteOption,
	getSiteWooCommerceUrl,
} from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

export function checkPrerequisites( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	// Only allow AT sites to access.
	if ( ! isAtomicSite( state, siteId ) ) {
		return page.redirect( `/home/${ site.slug }` );
	}

	// WooCommerce plugin is already installed, redirect to Woo.
	if ( getSiteOption( state, siteId, 'is_wpcom_store' ) ) {
		const redirectUrl = getSiteWooCommerceUrl( state, siteId );
		window.location.href = redirectUrl;
		return;
	}

	next();
}

export function setup( context, next ) {
	// Invalid site, redirect to select site.
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

	context.primary = React.createElement( main );
	next();
}

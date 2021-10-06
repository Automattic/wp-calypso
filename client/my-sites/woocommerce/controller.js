import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { createElement } from 'react';
import { getSiteFragment } from 'calypso/lib/route';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getSelectedSiteWithFallback,
	getSiteOption,
	getSiteWooCommerceUrl,
} from 'calypso/state/sites/selectors';
import main from './main';

export function checkPrerequisites( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	// Show the woo install page on all plans.
	if ( ! isEnabled( 'woop' ) ) {
		// Only allow AT sites to access.
		if ( ! isAtomicSite( state, siteId ) ) {
			return page.redirect( `/home/${ site.slug }` );
		}
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

	context.primary = createElement( main );
	next();
}

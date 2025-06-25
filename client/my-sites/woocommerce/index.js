import page from '@automattic/calypso-router';
import { createElement } from 'react';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import {
	getSelectedSiteWithFallback,
	getSiteOption,
	getSiteWooCommerceUrl,
} from 'calypso/state/sites/selectors';
import Main from './main';

import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout, clientRender );
	router(
		'/woocommerce-installation/:site',
		siteSelection,
		navigation,
		setup,
		makeLayout,
		clientRender
	);
}

function setup( context, next ) {
	// Invalid site fragement, redirect to site selector
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	// WooCommerce plugin is already installed, redirect to Woo.
	// todo: replace with a plugin check that replaces the cta with a link to wc-admin
	// instead of passive redirect.
	if ( getSiteOption( state, siteId, 'is_wpcom_store' ) ) {
		const redirectUrl = getSiteWooCommerceUrl( state, siteId );
		window.location.assign( redirectUrl );
		return;
	}

	context.primary = createElement( Main );
	next();
}

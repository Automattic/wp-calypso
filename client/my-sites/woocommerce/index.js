import config from '@automattic/calypso-config';
import page from 'page';
import { createElement } from 'react';
import { makeLayout } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteWithFallback } from 'calypso/state/sites/selectors';
import main from './main';

import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout );
	router( '/woocommerce-installation/:site', siteSelection, navigation, setup, makeLayout );
}

function setup( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	// Only allow AT sites to access, unless the woop feature flag is enabled.
	if ( ! config.isEnabled( 'woop' ) && ! isAtomicSite( state, siteId ) ) {
		return page.redirect( `/home/${ site.slug }` );
	}

	// Invalid site, redirect to select site.
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

	context.primary = createElement( main );
	next();
}

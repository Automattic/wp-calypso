import { isEnabled } from '@automattic/calypso-config';
import {
	isFreePlan,
	isPremiumPlan,
	isPersonalPlan,
	isEcommercePlan,
	isBusinessPlan,
} from '@automattic/calypso-products';
import page from 'page';
import { createElement } from 'react';
import { makeLayout } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, navigation, sites } from 'calypso/my-sites/controller';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import {
	getSelectedSiteWithFallback,
	getSiteOption,
	getSiteWooCommerceUrl,
} from 'calypso/state/sites/selectors';
import main from './main';

import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout );
	router( '/woocommerce-installation/:site', siteSelection, navigation, setup, makeLayout );
}

function setup( context, next ) {
	// Invalid site fragement, redirect to site selector
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	if ( isEnabled( 'woop' ) ) {
		// Limit access to the landing page
		if (
			! site ||
			isSiteWPForTeams( state, site.ID ) ||
			isDomainOnlySite( state, site.ID ) ||
			! (
				isFreePlan( site.plan.product_slug ) ||
				isPersonalPlan( site.plan.product_slug ) ||
				isPremiumPlan( site.plan.product_slug ) ||
				isBusinessPlan( site.plan.product_slug ) ||
				isEcommercePlan( site.plan.product_slug )
			)
		) {
			return page.redirect( `/home/${ site.slug }` );
		}
	} else {
		// Only allow AT sites to access, unless the woop feature flag is enabled.
		if ( ! isAtomicSite( state, siteId ) ) {
			return page.redirect( `/home/${ site.slug }` );
		}

		// WooCommerce plugin is already installed, redirect to Woo.
		// todo: replace with a plugin check that replaces the cta with a link to wc-admin
		// instead of passive redirect.
		if ( getSiteOption( state, siteId, 'is_wpcom_store' ) ) {
			const redirectUrl = getSiteWooCommerceUrl( state, siteId );
			window.location.href = redirectUrl;
			return;
		}
	}

	context.primary = createElement( main );
	next();
}

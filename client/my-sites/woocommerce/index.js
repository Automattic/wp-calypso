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
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteWithFallback } from 'calypso/state/sites/selectors';
import main from './main';

import './style.scss';

export default function ( router ) {
	router( '/woocommerce-installation', siteSelection, sites, makeLayout );
	router( '/woocommerce-installation/:site', siteSelection, navigation, setup, makeLayout );
}

function setup( context, next ) {
	// Invalid site fragement, redirect to site selector leveraging the fallback
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

	const state = context.store.getState();
	const site = getSelectedSiteWithFallback( state );

	if ( isEnabled( 'woop' ) ) {
		// Landing page access requires non p2 site on any plan.
		if (
			! site ||
			isSiteWPForTeams( state, site.ID ) ||
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
	} else if ( ! site ) {
		// Only allow AT sites to access, unless the woop feature flag is enabled.
		return page.redirect( '/home' );
	} else if ( ! isAtomicSite( state, site.ID || null ) ) {
		return page.redirect( `/home/${ site.slug || '' }` );
	}

	context.primary = createElement( main );
	next();
}

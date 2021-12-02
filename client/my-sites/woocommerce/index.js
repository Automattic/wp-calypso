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
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
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

	// Invalid site fragement, redirect to site selector leveraging the fallback
	if ( ! getSiteFragment( context.path ) ) {
		return page.redirect( '/woocommerce-installation' );
	}

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

	context.primary = createElement( main );
	next();
}

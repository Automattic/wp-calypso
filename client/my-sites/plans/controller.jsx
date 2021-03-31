/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Plans from './plans';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { productSelect } from 'calypso/my-sites/plans/jetpack-plans/controller';
import setJetpackPlansHeader from 'calypso/my-sites/plans/jetpack-plans/plans-header';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

function showJetpackPlans( context ) {
	const getState = context.store.getState();
	const siteId = getSelectedSiteId( getState );
	const isWpcom = isSiteWpcom( getState, siteId );
	return ! isWpcom;
}

export function plans( context, next ) {
	if ( showJetpackPlans( context ) ) {
		if ( context.params.intervalType ) {
			return page.redirect( `/plans/${ context.params.site }` );
		}
		setJetpackPlansHeader( context );
		return productSelect( '/plans' )( context, next );
	}

	context.primary = (
		<CalypsoShoppingCartProvider>
			<Plans
				context={ context }
				intervalType={ context.params.intervalType }
				customerType={ context.query.customerType }
				selectedFeature={ context.query.feature }
				selectedPlan={ context.query.plan }
				withDiscount={ context.query.discount }
				discountEndDate={ context.query.ts }
				redirectTo={ context.query.redirect_to }
			/>
		</CalypsoShoppingCartProvider>
	);
	next();
}

export function features( context ) {
	const domain = context.params.domain;
	const feature = get( context, 'params.feature' );
	let comparePath = domain ? `/plans/${ domain }` : '/plans/';

	if ( isValidFeatureKey( feature ) ) {
		comparePath += '?feature=' + feature;
	}

	// otherwise redirect to the compare page if not found
	page.redirect( comparePath );
}

export function redirectToCheckout( context ) {
	// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
	page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
}

export function redirectToPlans( context ) {
	const siteDomain = context.params.domain;

	if ( siteDomain ) {
		return page.redirect( `/plans/${ siteDomain }` );
	}

	return page.redirect( '/plans' );
}

export function redirectToPlansIfNotJetpack( context, next ) {
	if ( ! showJetpackPlans( context ) ) {
		page.redirect( `/plans/${ context.params.site }` );
	}
	next();
}

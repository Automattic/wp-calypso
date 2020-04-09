/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ScanPage from './main';
import ScanHistoryPage from './history';
import ScanUpsellPage from './upsell';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { JETPACK_SCAN_PRODUCTS, PRODUCT_JETPACK_SCAN } from 'lib/products-values/constants';
import { getPlan, planHasFeature } from 'lib/plans';
import { fetchSitePurchases } from 'state/purchases/actions';
import { makeLayout, render as clientRender } from 'controller';

export function showUpsellIfNoScan( context, next ) {
	const getState = context.store.getState;
	const dispatch = context.store.dispatch;
	const siteId = getSelectedSiteId( getState() );
	let purchases = getSitePurchases( getState(), siteId );

	const showUpsellOrNext = () => {
		const hasScan = purchases.find(
			purchase =>
				JETPACK_SCAN_PRODUCTS.includes( purchase.productSlug ) ||
				( getPlan( purchase.productSlug ) &&
					planHasFeature( purchase.productSlug, PRODUCT_JETPACK_SCAN ) )
		);
		if ( hasScan ) {
			return next();
		}
		context.primary = <ScanUpsellPage />;
		makeLayout( context, noop );
		clientRender( context );
	};

	if ( purchases.length ) {
		return showUpsellOrNext();
	}
	dispatch( fetchSitePurchases( siteId ) ).then( () => {
		purchases = getSitePurchases( getState(), siteId );
		showUpsellOrNext();
	} );
}

export function scan( context, next ) {
	context.primary = <ScanPage />;
	next();
}

export function scanHistory( context, next ) {
	const { filter } = context.params;
	context.primary = <ScanHistoryPage filter={ filter } />;
	next();
}

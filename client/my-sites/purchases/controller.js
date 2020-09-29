/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	Purchases,
	PurchaseDetails,
	PurchaseCancel,
	PurchaseCancelDomain,
} from 'my-sites/purchases/main.tsx';

export function redirectToPurchases( context ) {
	const siteDomain = context.params.site;

	if ( siteDomain ) {
		return page.redirect( `/purchases/subscriptions/${ siteDomain }` );
	}

	return page.redirect( '/purchases' );
}

export const purchases = ( context, next ) => {
	context.primary = <Purchases />;
	next();
};

export const purchaseDetails = ( context, next ) => {
	context.primary = (
		<PurchaseDetails
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

export const purchaseCancel = ( context, next ) => {
	context.primary = (
		<PurchaseCancel
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

export const purchaseCancelDomain = ( context, next ) => {
	context.primary = (
		<PurchaseCancelDomain
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

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
	PurchaseChangePaymentMethod,
} from 'calypso/my-sites/purchases/main';
import { BillingHistory, ReceiptView } from 'calypso/my-sites/purchases/billing-history';
import { PaymentMethods, AddNewPaymentMethod } from 'calypso/my-sites/purchases/payment-methods';

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

export const purchaseChangePaymentMethod = ( context, next ) => {
	context.primary = (
		<PurchaseChangePaymentMethod
			cardId={ context.params.cardId }
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

export const paymentMethods = ( context, next ) => {
	context.primary = <PaymentMethods siteSlug={ context.params.site } />;
	next();
};

export const addPaymentMethod = ( context, next ) => {
	context.primary = <AddNewPaymentMethod siteSlug={ context.params.site } />;
	next();
};

export const billingHistory = ( context, next ) => {
	context.primary = <BillingHistory siteSlug={ context.params.site } />;
	next();
};

export const receiptView = ( context, next ) => {
	context.primary = (
		<ReceiptView receiptId={ context.params.receiptId } siteSlug={ context.params.site } />
	);
	next();
};

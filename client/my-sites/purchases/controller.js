import page from '@automattic/calypso-router';
import { BillingHistory, ReceiptView } from 'calypso/my-sites/purchases/billing-history';
import CrmDownloads from 'calypso/my-sites/purchases/crm-downloads';
import {
	Purchases,
	PurchaseDetails,
	PurchaseCancel,
	PurchaseCancelDomain,
	PurchaseChangePaymentMethod,
	PurchaseDowngrade,
} from 'calypso/my-sites/purchases/main';
import {
	PaymentMethods,
	SiteLevelAddNewPaymentMethod,
} from 'calypso/my-sites/purchases/payment-methods';

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

export const planDowngrade = ( context, next ) => {
	context.primary = (
		<PurchaseDowngrade
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
	context.primary = <SiteLevelAddNewPaymentMethod siteSlug={ context.params.site } />;
	next();
};

export const billingHistory = ( context, next ) => {
	context.primary = <BillingHistory siteSlug={ context.params.site } />;
	next();
};

export const receiptView = ( context, next ) => {
	context.primary = (
		<ReceiptView
			receiptId={ parseInt( context.params.receiptId, 10 ) }
			siteSlug={ context.params.site }
		/>
	);
	next();
};

export const crmDownloads = ( context, next ) => {
	context.primary = <CrmDownloads subscription={ context.params.subscription } />;
	next();
};

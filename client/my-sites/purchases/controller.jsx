import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getCancelIntentFromQuery } from 'calypso/lib/purchases/utils';
import { BillingHistory, ReceiptView } from 'calypso/my-sites/purchases/billing-history';
import CrmDownloads from 'calypso/my-sites/purchases/crm-downloads';
import {
	Purchases,
	PurchaseDetails,
	PurchaseCancel,
	PurchaseCancelDomain,
	PurchaseChangePaymentMethod,
} from 'calypso/my-sites/purchases/main';
import {
	PaymentMethods,
	SiteLevelAddNewPaymentMethod,
} from 'calypso/my-sites/purchases/payment-methods';
import SitePurchasesBackport from 'calypso/my-sites/purchases/v2/main';

export function isDashboardBackportEnabled() {
	return isEnabled( 'purchases/site-level-dashboard-backport' );
}

/**
 * Serve a site-level purchases route with the Dashboard's own billing screens,
 * falling back to the classic component when the backport is off.
 * @param {string|undefined} section Section tab to highlight, for the three top-level pages.
 * @param {Function} classicHandler The page.js handler to fall back to.
 * @returns {Function} A page.js handler.
 */
const withDashboardBackport = ( section, classicHandler ) => ( context, next ) => {
	if ( ! isDashboardBackportEnabled() ) {
		return classicHandler( context, next );
	}

	context.primary = (
		<SitePurchasesBackport
			path={ context.path }
			section={ section }
			siteSlug={ context.params.site }
		/>
	);
	next();
};

export function redirectToPurchases( context ) {
	const siteDomain = context.params.site;

	if ( siteDomain ) {
		return page.redirect( `/purchases/subscriptions/${ siteDomain }` );
	}

	return page.redirect( '/purchases' );
}

const classicPurchases = ( context, next ) => {
	context.primary = <Purchases />;
	next();
};

export const purchases = withDashboardBackport( 'activeUpgrades', classicPurchases );

const classicPurchaseDetails = ( context, next ) => {
	context.primary = (
		<PurchaseDetails
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

export const purchaseDetails = withDashboardBackport( undefined, classicPurchaseDetails );

const classicPurchaseCancel = ( context, next ) => {
	context.primary = (
		<PurchaseCancel
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
			intent={ getCancelIntentFromQuery( context.query ?? {} ) }
		/>
	);
	next();
};

export const purchaseCancel = withDashboardBackport( undefined, classicPurchaseCancel );

export const purchaseCancelDomain = ( context, next ) => {
	context.primary = (
		<PurchaseCancelDomain
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

const classicPurchaseChangePaymentMethod = ( context, next ) => {
	context.primary = (
		<PurchaseChangePaymentMethod
			siteSlug={ context.params.site }
			purchaseId={ parseInt( context.params.purchaseId, 10 ) }
		/>
	);
	next();
};

export const purchaseChangePaymentMethod = withDashboardBackport(
	undefined,
	classicPurchaseChangePaymentMethod
);

const classicPaymentMethods = ( context, next ) => {
	context.primary = <PaymentMethods siteSlug={ context.params.site } />;
	next();
};

export const paymentMethods = withDashboardBackport( 'paymentMethods', classicPaymentMethods );

const classicAddPaymentMethod = ( context, next ) => {
	context.primary = <SiteLevelAddNewPaymentMethod siteSlug={ context.params.site } />;
	next();
};

export const addPaymentMethod = withDashboardBackport( undefined, classicAddPaymentMethod );

const classicBillingHistory = ( context, next ) => {
	context.primary = <BillingHistory siteSlug={ context.params.site } />;
	next();
};

export const billingHistory = withDashboardBackport( 'billingHistory', classicBillingHistory );

const classicReceiptView = ( context, next ) => {
	context.primary = (
		<ReceiptView
			receiptId={ parseInt( context.params.receiptId, 10 ) }
			siteSlug={ context.params.site }
		/>
	);
	next();
};

export const receiptView = withDashboardBackport( undefined, classicReceiptView );

export const crmDownloads = ( context, next ) => {
	context.primary = <CrmDownloads subscription={ context.params.subscription } />;
	next();
};

export const purchaseCancelDomainOrBackport = ( context, next ) => {
	if ( isDashboardBackportEnabled() ) {
		const { site, purchaseId } = context.params;
		return page.redirect( `/purchases/subscriptions/${ site }/${ purchaseId }/cancel` );
	}
	return purchaseCancelDomain( context, next );
};

export const addPaymentMethodOrBackport = ( context, next ) => {
	if ( isDashboardBackportEnabled() ) {
		return page.redirect( `/purchases/payment-methods/${ context.params.site }/add` );
	}
	return addPaymentMethod( context, next );
};

export const purchaseChangePaymentMethodLegacyPath = ( context, next ) => {
	if ( isDashboardBackportEnabled() ) {
		const { site, purchaseId } = context.params;
		return page.redirect(
			`/purchases/subscriptions/${ site }/${ purchaseId }/payment-method/change`
		);
	}
	return purchaseChangePaymentMethod( context, next );
};

/**
 * The interstitial that offers to apply an action to every purchase on a site
 * exists only in the Dashboard screens, so without the backport there is
 * nothing to show and we fall back to the purchase itself.
 */
export const purchaseSiteActions = ( context, next ) => {
	if ( ! isDashboardBackportEnabled() ) {
		const { site, purchaseId } = context.params;
		return page.redirect( `/purchases/subscriptions/${ site }/${ purchaseId }` );
	}

	context.primary = (
		<SitePurchasesBackport path={ context.path } siteSlug={ context.params.site } />
	);
	next();
};

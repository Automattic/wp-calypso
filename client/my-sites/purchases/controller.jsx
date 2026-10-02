import page from '@automattic/calypso-router';
import CrmDownloads from 'calypso/my-sites/purchases/crm-downloads';
import SitePurchasesBackport from 'calypso/my-sites/purchases/v2/main';

/**
 * Serve a site-level purchases route with the Dashboard's own billing screens.
 * @param {string|undefined} section Section tab to highlight, for the three top-level pages.
 * @returns {Function} A page.js handler.
 */
const dashboardBackport = ( section ) => ( context, next ) => {
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

export const purchases = dashboardBackport( 'activeUpgrades' );

export const purchaseDetails = dashboardBackport();

export const purchaseCancel = dashboardBackport();

export const purchaseChangePaymentMethod = dashboardBackport();

export const purchaseSiteActions = dashboardBackport();

export const paymentMethods = dashboardBackport( 'paymentMethods' );

export const addPaymentMethod = dashboardBackport();

export const billingHistory = dashboardBackport( 'billingHistory' );

export const receiptView = dashboardBackport();

export const crmDownloads = ( context, next ) => {
	context.primary = <CrmDownloads subscription={ context.params.subscription } />;
	next();
};

export const redirectToPurchaseCancel = ( context ) => {
	const { site, purchaseId } = context.params;
	return page.redirect( `/purchases/subscriptions/${ site }/${ purchaseId }/cancel` );
};

export const redirectToAddPaymentMethod = ( context ) =>
	page.redirect( `/purchases/payment-methods/${ context.params.site }/add` );

export const redirectToChangePaymentMethod = ( context ) => {
	const { site, purchaseId } = context.params;
	return page.redirect(
		`/purchases/subscriptions/${ site }/${ purchaseId }/payment-method/change`
	);
};

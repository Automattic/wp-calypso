import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	stagingSiteNotSupportedRedirect,
	sites,
} from 'calypso/my-sites/controller';
import {
	purchases,
	redirectToPurchases,
	purchaseDetails,
	purchaseCancel,
	purchaseCancelDomain,
	purchaseChangePaymentMethod,
	billingHistory,
	receiptView,
	paymentMethods,
	addPaymentMethod,
	planDowngrade,
	crmDownloads,
} from './controller';

const commonHandlers = [ siteSelection, navigation, stagingSiteNotSupportedRedirect ];

export default ( router ) => {
	page( '/purchases', ...commonHandlers, sites, makeLayout, clientRender );

	page( '/purchases/subscriptions', ...commonHandlers, sites, makeLayout, clientRender );

	page( '/purchases/:site', ...commonHandlers, redirectToPurchases, makeLayout, clientRender );

	page( '/purchases/subscriptions/:site', ...commonHandlers, purchases, makeLayout, clientRender );

	page(
		'/purchases/subscriptions/:site/:purchaseId',
		...commonHandlers,
		purchaseDetails,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/cancel',
		...commonHandlers,
		purchaseCancel,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/downgrade',
		...commonHandlers,
		planDowngrade,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/confirm-cancel-domain',
		...commonHandlers,
		purchaseCancelDomain,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/payment-method/add',
		...commonHandlers,
		purchaseChangePaymentMethod,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/subscriptions/:site/:purchaseId/payment-method/change/:cardId',
		...commonHandlers,
		purchaseChangePaymentMethod,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/add-payment-method/:site',
		...commonHandlers,
		addPaymentMethod,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/billing-history/:site',
		...commonHandlers,
		billingHistory,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/billing-history/:site/:receiptId',
		...commonHandlers,
		receiptView,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/payment-methods/:site',
		...commonHandlers,
		paymentMethods,
		makeLayout,
		clientRender
	);

	page(
		'/purchases/crm-downloads/:site/:purchaseId',
		...commonHandlers,
		crmDownloads,
		makeLayout,
		clientRender
	);

	// Redirect legacy urls
	router( '/purchases/:siteName/:purchaseId', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }` )
	);
	router( '/purchases/:siteName/:purchaseId/cancel', ( { params: { siteName, purchaseId } } ) =>
		page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }/cancel` )
	);
	router(
		'/purchases/:siteName/:purchaseId/confirm-cancel-domain',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect(
				`/purchases/subscriptions/${ siteName }/${ purchaseId }/confirm-cancel-domain`
			)
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/add',
		( { params: { siteName, purchaseId } } ) =>
			page.redirect( `/purchases/subscriptions/${ siteName }/${ purchaseId }/payment-method/add` )
	);
	router(
		'/purchases/:siteName/:purchaseId/payment/edit/:cardId',
		( { params: { siteName, purchaseId, cardId } } ) =>
			page.redirect(
				`/purchases/subscriptions/${ siteName }/${ purchaseId }/payment-method/change/${ cardId }`
			)
	);
	router(
		'/purchases/subscriptions/:site/:purchaseId/payment/add',
		( { params: { site, purchaseId } } ) =>
			`/purchases/subscriptions/${ site }/${ purchaseId }/payment-method/add`
	);
	router(
		'/purchases/subscriptions/:site/:purchaseId/payment/edit/:cardId',
		( { params: { site, purchaseId, cardId } } ) =>
			`/purchases/subscriptions/${ site }/${ purchaseId }/payment-method/change/${ cardId }`
	);
	router(
		'/purchases/add-credit-card/:site',
		( { params: { site } } ) => `/purchases/add-payment-method/${ site }`
	);
};

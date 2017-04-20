/**
 * External Dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal Dependencies
 */
import billingController from 'me/billing-history/controller';
import meController from 'me/controller';
import sitesController from 'my-sites/controller';
import controller from './controller';
import paths from './paths';

export default function() {
	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		page(
			paths.addCreditCard(),
			meController.sidebar,
			controller.addCreditCard
		);

		// redirect legacy urls
		page(
			'/payment-methods/add-credit-card',
			() => page.redirect( paths.addCreditCard() )
		);
	}

	page(
		paths.billingHistory(),
		meController.sidebar,
		billingController.billingHistory
	);

	page(
		paths.billingHistoryReceipt(),
		meController.sidebar,
		billingController.transaction
	);

	page(
		paths.purchasesRoot(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.list
	);

	page(
		paths.managePurchase(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.managePurchase
	);

	page(
		paths.cancelPurchase(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.cancelPurchase
	);

	page(
		paths.cancelPrivacyProtection(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.cancelPrivacyProtection
	);

	page(
		paths.confirmCancelDomain(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.confirmCancelDomain
	);

	page(
		paths.addCardDetails(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.addCardDetails
	);

	page(
		paths.editCardDetails(),
		meController.sidebar,
		controller.noSitesMessage,
		sitesController.siteSelection,
		controller.editCardDetails
	);

	// redirect legacy urls
	page(
		'/purchases',
		() => page.redirect( paths.purchasesRoot() )
	);
	page(
		'/purchases/:siteName/:purchaseId',
		( { params: { siteName, purchaseId } } ) => page.redirect( paths.managePurchase( siteName, purchaseId ) )
	);
	page(
		'/purchases/:siteName/:purchaseId/cancel',
		( { params: { siteName, purchaseId } } ) => page.redirect( paths.cancelPurchase( siteName, purchaseId ) )
	);
	page(
		'/purchases/:siteName/:purchaseId/cancel-private-registration',
		( { params: { siteName, purchaseId } } ) => page.redirect( paths.cancelPrivacyProtection( siteName, purchaseId ) )
	);
	page(
		'/purchases/:siteName/:purchaseId/confirm-cancel-domain',
		( { params: { siteName, purchaseId } } ) => page.redirect( paths.confirmCancelDomain( siteName, purchaseId ) )
	);
	page(
		'/purchases/:siteName/:purchaseId/payment/add',
		( { params: { siteName, purchaseId } } ) => page.redirect( paths.addCardDetails( siteName, purchaseId ) )
	);
	page(
		'/purchases/:siteName/:purchaseId/payment/edit/:cardId',
		( { params: { siteName, purchaseId, cardId } } ) => page.redirect( paths.editCardDetails( siteName, purchaseId, cardId ) )
	);
	page(
		'/me/billing',
		() => page.redirect( paths.billingHistory() )
	);
	page(
		'/me/billing/:receiptId',
		( { params: { receiptId } } ) => page.redirect( paths.billingHistoryReceipt( receiptId ) )
	);
}

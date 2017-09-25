/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';

import checkoutController from './controller';
import SiftScience from 'lib/siftscience';

export default function() {
	SiftScience.recordUser();

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		controller.noSite,
		checkoutController.checkoutThankYou
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		controller.siteSelection,
		checkoutController.checkoutThankYou
	);

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		controller.siteSelection,
		checkoutController.checkout
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		controller.siteSelection,
		checkoutController.checkoutThankYou
	);

	page(
		'/checkout/no-site',
		controller.noSite,
		checkoutController.sitelessCheckout
	);

	page(
		'/checkout/:domain/:product?',
		controller.siteSelection,
		checkoutController.checkout
	);

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		controller.siteSelection,
		checkoutController.checkout
	);

	// Visting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );
}

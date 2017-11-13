/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { noSite, siteSelection } from 'my-sites/controller';
import checkoutController from './controller';
import SiftScience from 'lib/siftscience';

export default function() {
	SiftScience.recordUser();

	page( '/checkout/thank-you/no-site/:receiptId?', noSite, checkoutController.checkoutThankYou );

	page(
		'/checkout/thank-you/:site/:receiptId?',
		siteSelection,
		checkoutController.checkoutThankYou
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		siteSelection,
		checkoutController.checkoutThankYou
	);

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		siteSelection,
		checkoutController.checkout
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		siteSelection,
		checkoutController.checkoutThankYou
	);

	page( '/checkout/no-site', noSite, checkoutController.sitelessCheckout );

	page( '/checkout/:domain/:product?', siteSelection, checkoutController.checkout );

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		siteSelection,
		checkoutController.checkout
	);

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		siteSelection,
		checkoutController.gsuiteNudge
	);

	// Visting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );
}

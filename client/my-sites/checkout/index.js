/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import checkoutController from './controller';
import SiftScience from 'lib/siftscience';
import userFactory from 'lib/user';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';
import { noSite, siteSelection } from 'my-sites/controller';

export default function() {
	const user = userFactory();
	const isLoggedOut = ! user.get();

	SiftScience.recordUser();

	// TODO (seear): Temporary logged-out handling. Remove when a general solution arrives in #23785.
	if ( isLoggedOut ) {
		page(
			'/checkout/:domain/:product?',
			redirectLoggedOut,
			siteSelection,
			checkoutController.checkout,
			makeLayout,
			clientRender
		);
		return;
	}

	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		siteSelection,
		checkoutController.checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		noSite,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/pending/:orderId',
		siteSelection,
		checkoutController.checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		siteSelection,
		checkoutController.checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/no-site',
		noSite,
		checkoutController.sitelessCheckout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		siteSelection,
		checkoutController.checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:domain/:product?',
		siteSelection,
		checkoutController.checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		siteSelection,
		checkoutController.checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		siteSelection,
		checkoutController.gsuiteNudge,
		makeLayout,
		clientRender
	);

	// Visting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );
}

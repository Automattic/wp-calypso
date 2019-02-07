/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	checkout,
	checkoutPending,
	checkoutThankYou,
	gsuiteNudge,
	sitelessCheckout,
	conciergeSessionNudge,
} from './controller';
import SiftScience from 'lib/siftscience';
import { makeLayout, render as clientRender } from 'controller';
import { noSite, siteSelection } from 'my-sites/controller';
import config from 'config';

export default function() {
	SiftScience.recordUser();

	page(
		'/checkout/thank-you/no-site/pending/:orderId',
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/no-site/:receiptId?',
		noSite,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/pending/:orderId',
		siteSelection,
		checkoutPending,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId?',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/:site/:receiptId/with-gsuite/:gsuiteReceiptId',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/thank-you/features/:feature/:site/:receiptId?',
		siteSelection,
		checkoutThankYou,
		makeLayout,
		clientRender
	);

	page( '/checkout/no-site', noSite, sitelessCheckout, makeLayout, clientRender );

	page(
		'/checkout/features/:feature/:domain/:plan_name?',
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'upsell/concierge-session' ) ) {
		page(
			'/checkout/:site/add-support-session/:receiptId?',
			siteSelection,
			conciergeSessionNudge,
			makeLayout,
			clientRender
		);
	}

	page( '/checkout/:domain/:product?', siteSelection, checkout, makeLayout, clientRender );

	// Visiting /renew without a domain is invalid and should be redirected to /me/purchases
	page( '/checkout/:product/renew/:purchaseId', '/me/purchases' );

	page(
		'/checkout/:product/renew/:purchaseId/:domain',
		siteSelection,
		checkout,
		makeLayout,
		clientRender
	);

	page(
		'/checkout/:site/with-gsuite/:domain/:receiptId?',
		siteSelection,
		gsuiteNudge,
		makeLayout,
		clientRender
	);

	// Visiting /checkout without a plan or product should be redirected to /plans
	page( '/checkout', '/plans' );
}

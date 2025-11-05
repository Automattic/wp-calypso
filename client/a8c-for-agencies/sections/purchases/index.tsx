import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	EXTERNAL_WPCOM_PAYMENT_METHODS_URL,
	EXTERNAL_WPCOM_BILLING_HISTORY_URL,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	purchasesContext,
	licensesContext,
	billingContext,
	invoicesContext,
	paymentMethodsContext,
	paymentMethodsAddContext,
	crmDownloadsContext,
} from './controller';

export default function () {
	const isBillingDragonCheckoutEnabled = isEnabled( 'a4a-bd-checkout' );

	// Purchases
	page( '/purchases', requireAccessContext, purchasesContext, makeLayout, clientRender );

	// Licenses
	page(
		'/purchases/licenses/:filter(unassigned|assigned|revoked|standard)?',
		requireAccessContext,
		licensesContext,
		makeLayout,
		clientRender
	);

	page( '/purchases/licenses/*', '/purchases/licenses' ); // Redirect invalid license list filters back to the main portal page.

	if ( isBillingDragonCheckoutEnabled ) {
		const redirectToWpcomPaymentMethods = () => page.redirect( EXTERNAL_WPCOM_PAYMENT_METHODS_URL );
		const redirectToWpcomInvoices = () => page.redirect( EXTERNAL_WPCOM_BILLING_HISTORY_URL );

		// Payment methods (redirect to WPCOM)
		page( '/purchases/payment-methods', requireAccessContext, redirectToWpcomPaymentMethods );
		page( '/purchases/payment-methods/add', requireAccessContext, redirectToWpcomPaymentMethods );

		// Invoices (redirect to WPCOM)
		page( '/purchases/invoices', requireAccessContext, redirectToWpcomInvoices );
	} else {
		// Billing
		page( '/purchases/billing', requireAccessContext, billingContext, makeLayout, clientRender );

		// Payment methods
		page(
			'/purchases/payment-methods',
			requireAccessContext,
			paymentMethodsContext,
			makeLayout,
			clientRender
		);
		page(
			'/purchases/payment-methods/add',
			requireAccessContext,
			paymentMethodsAddContext,
			makeLayout,
			clientRender
		);

		// Invoices
		page( '/purchases/invoices', requireAccessContext, invoicesContext, makeLayout, clientRender );
	}

	// CRM Downloads
	page(
		'/purchases/crm-downloads/:licenseKey',
		// requireAccessContext,
		crmDownloadsContext,
		makeLayout,
		clientRender
	);
}

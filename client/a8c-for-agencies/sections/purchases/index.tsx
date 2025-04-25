import page from '@automattic/calypso-router';
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

	// Billing
	page( '/purchases/billing', requireAccessContext, billingContext, makeLayout, clientRender );

	// Payment Methods
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

	// CRM Downloads
	page(
		'/purchases/crm-downloads/:licenseKey',
		// requireAccessContext,
		crmDownloadsContext,
		makeLayout,
		clientRender
	);
}

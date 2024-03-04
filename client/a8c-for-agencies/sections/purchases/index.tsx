import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	purchasesContext,
	licensesContext,
	billingContext,
	invoicesContext,
	paymentMethodsContext,
} from './controller';

export default function () {
	// FIXME: check access, TOS consent, and partner key selection

	// Purchases
	page( '/purchases', purchasesContext, makeLayout, clientRender );

	// Licenses
	page(
		'/purchases/licenses/:filter(unassigned|assigned|revoked|standard)?',
		licensesContext,
		makeLayout,
		clientRender
	);

	page( `/purchases/licenses/*`, '/purchases/licenses' ); // Redirect invalid license list filters back to the main portal page.

	// Billing
	page( '/purchases/billing', billingContext, makeLayout, clientRender );

	// Payment Methods
	page( '/purchases/payment-methods', paymentMethodsContext, makeLayout, clientRender );

	// Invoices
	page( '/purchases/invoices', invoicesContext, makeLayout, clientRender );
}

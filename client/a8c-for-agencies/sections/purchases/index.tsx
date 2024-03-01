import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { purchasesContext, licensesContext, billingContext } from './controller';

export default function () {
	// FIXME: check access, TOS consent, and partner key selection
	page( '/purchases', purchasesContext, makeLayout, clientRender );

	// Licenses
	page(
		'/purchases/licenses/:filter(unassigned|assigned|revoked|standard)?',
		licensesContext,
		makeLayout,
		clientRender
	);
	// Redirect invalid license list filters back to the main portal page.
	page( `/purchases/licenses/*`, '/purchases/licenses' );

	// Billing
	page( '/purchases/billing', billingContext, makeLayout, clientRender );
}

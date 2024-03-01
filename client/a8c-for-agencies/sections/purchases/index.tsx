import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { purchasesContext, licensesContext } from './controller';

export default function () {
	// FIXME: check access, TOS consent, and partner key selection
	page( '/purchases', purchasesContext, makeLayout, clientRender );
	page(
		'/purchases/licenses/:filter(unassigned|assigned|revoked|standard)?',
		licensesContext,
		makeLayout,
		clientRender
	);

	// Redirect invalid license list filters back to the main portal page.
	page( `/purchases/licenses/*`, '/purchases/licenses' );
}

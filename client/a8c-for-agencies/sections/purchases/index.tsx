import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	billingContext,
	invoicesContext,
	paymentMethodsContext,
	purchasesContext,
} from './controller';

export default function () {
	page( '/purchases', purchasesContext, makeLayout, clientRender );
	page( '/purchases/billing', billingContext, makeLayout, clientRender );
	page( '/purchases/payment-methods', paymentMethodsContext, makeLayout, clientRender );
	page( '/purchases/invoices', invoicesContext, makeLayout, clientRender );
}

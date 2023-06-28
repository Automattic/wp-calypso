import page from 'page';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import {
	sidebar,
	dashboardRedirect,
	dashboard,
	plugins,
	licenses,
	billing,
	paymentMethods,
	invoices,
	prices,
	companyDetails,
} from './controller';

export default async function () {
	page( '/agency', redirectLoggedOutToSignup, sidebar, makeLayout, dashboardRedirect );

	page(
		'/agency/dashboard',
		redirectLoggedOutToSignup,
		sidebar,
		dashboard,
		makeLayout,
		clientRender
	);

	page( '/agency/plugins', redirectLoggedOutToSignup, sidebar, plugins, makeLayout, clientRender );

	page(
		'/agency/licenses',
		redirectLoggedOutToSignup,
		sidebar,
		licenses,
		makeLayout,
		clientRender
	);

	page( '/agency/billing', redirectLoggedOutToSignup, sidebar, billing, makeLayout, clientRender );

	page(
		'/agency/payment-methods',
		redirectLoggedOutToSignup,
		sidebar,
		paymentMethods,
		makeLayout,
		clientRender
	);

	page(
		'/agency/invoices',
		redirectLoggedOutToSignup,
		sidebar,
		invoices,
		makeLayout,
		clientRender
	);

	page( '/agency/prices', redirectLoggedOutToSignup, sidebar, prices, makeLayout, clientRender );

	page(
		'/agency/company-details',
		redirectLoggedOutToSignup,
		sidebar,
		companyDetails,
		makeLayout,
		clientRender
	);
}

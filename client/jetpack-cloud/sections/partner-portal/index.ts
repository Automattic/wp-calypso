import config from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import * as controller from './controller';
import './style.scss';

export default function () {
	// Load the partner for the current user.
	page( `/partner-portal/partner`, controller.partnerContext, makeLayout, clientRender );

	// Display the ToS, if necessary.
	page(
		`/partner-portal/terms-of-service`,
		controller.requireAccessContext,
		controller.termsOfServiceContext,
		makeLayout,
		clientRender
	);

	// Display the list of partner keys for the user to select from.
	page(
		`/partner-portal/partner-key`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.partnerKeyContext,
		makeLayout,
		clientRender
	);

	// List licenses.
	page(
		`/partner-portal/licenses/:filter(unassigned|assigned|revoked)?`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.licensesContext,
		makeLayout,
		clientRender
	);

	// Redirect invalid license list filters back to the main portal page.
	page( `/partner-portal/licenses/*`, '/partner-portal/licenses' );

	// Issue a license.
	page(
		`/partner-portal/issue-license`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.issueLicenseContext,
		makeLayout,
		clientRender
	);

	// Assign a license to a site.
	page(
		`/partner-portal/assign-license`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.assignLicenseContext,
		makeLayout,
		clientRender
	);

	// Manage payment methods.
	if ( config.isEnabled( 'jetpack/partner-portal-payment' ) ) {
		page(
			`/partner-portal/payment-methods`,
			controller.requireAccessContext,
			controller.requireTermsOfServiceConsentContext,
			controller.requireSelectedPartnerKeyContext,
			controller.paymentMethodListContext,
			makeLayout,
			clientRender
		);

		page(
			`/partner-portal/payment-methods/add`,
			controller.requireAccessContext,
			controller.requireTermsOfServiceConsentContext,
			controller.requireSelectedPartnerKeyContext,
			controller.paymentMethodAddContext,
			makeLayout,
			clientRender
		);

		page(
			`/partner-portal/invoices`,
			controller.requireAccessContext,
			controller.requireTermsOfServiceConsentContext,
			controller.requireSelectedPartnerKeyContext,
			controller.invoicesDashboardContext,
			makeLayout,
			clientRender
		);

		page(
			`/partner-portal/company-details`,
			controller.requireAccessContext,
			controller.requireTermsOfServiceConsentContext,
			controller.requireSelectedPartnerKeyContext,
			controller.companyDetailsDashboardContext,
			makeLayout,
			clientRender
		);
	}

	// Billing Dashboard.
	page(
		`/partner-portal/billing`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.billingDashboardContext,
		makeLayout,
		clientRender
	);

	// Landing Page
	page(
		`/partner-portal`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.landingPageContext,
		makeLayout,
		clientRender
	);
}

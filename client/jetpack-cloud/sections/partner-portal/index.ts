import config from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import * as controller from './controller';
import './style.scss';

export default function () {
	// Load the partner for the current user.
	page(
		`/partner-portal/partner`,
		controller.partnerContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Display the ToS, if necessary.
	page(
		`/partner-portal/terms-of-service`,
		controller.requireAccessContext,
		controller.termsOfServiceContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Display the list of partner keys for the user to select from.
	page(
		`/partner-portal/partner-key`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.partnerKeyContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// List licenses.
	page(
		`/partner-portal/licenses/:filter(unassigned|assigned|revoked|standard)?`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.licensesContext,
		controller.allSitesContext,
		controller.verifyUnpaidInvoices,
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
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Assign a license to a site.
	page(
		`/partner-portal/assign-license`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.requireValidPaymentMethod,
		controller.assignLicenseContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Download 3rd party products after assigning
	page(
		`/partner-portal/download-products`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.requireValidPaymentMethod,
		controller.downloadProductsContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Manage payment methods.
	page(
		`/partner-portal/payment-methods`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.paymentMethodListContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/payment-methods/add`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.paymentMethodAddContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/invoices`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.invoicesDashboardContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/company-details`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.companyDetailsDashboardContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Pricing page
	page(
		`/partner-portal/prices`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.pricesContext,
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// Billing dashboard
	page(
		`/partner-portal/billing`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.billingDashboardContext,
		controller.allSitesContext,
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
		controller.allSitesContext,
		makeLayout,
		clientRender
	);

	// WPCOM Atomic Hosting Page
	if ( config.isEnabled( 'jetpack/pro-dashboard-wpcom-atomic-hosting' ) ) {
		page(
			`/partner-portal/create-site`,
			controller.requireAccessContext,
			controller.requireTermsOfServiceConsentContext,
			controller.requireSelectedPartnerKeyContext,
			controller.wpcomAtomicHostingContext,
			controller.allSitesContext,
			makeLayout,
			clientRender
		);
	}
}

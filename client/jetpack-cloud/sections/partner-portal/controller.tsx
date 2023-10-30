import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import {
	publicToInternalLicenseFilter,
	publicToInternalLicenseSortField,
	valueToEnum,
	ensurePartnerPortalReturnUrl,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseSelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/license-select-partner-key';
import AssignLicense from 'calypso/jetpack-cloud/sections/partner-portal/primary/assign-license';
import BillingDashboard from 'calypso/jetpack-cloud/sections/partner-portal/primary/billing-dashboard';
import CompanyDetailsDashboard from 'calypso/jetpack-cloud/sections/partner-portal/primary/company-details-dashboard';
import DownloadProducts from 'calypso/jetpack-cloud/sections/partner-portal/primary/download-products';
import InvoicesDashboard from 'calypso/jetpack-cloud/sections/partner-portal/primary/invoices-dashboard';
import IssueLicense from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license';
import Licenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/licenses';
import PartnerAccess from 'calypso/jetpack-cloud/sections/partner-portal/primary/partner-access';
import PaymentMethodAdd from 'calypso/jetpack-cloud/sections/partner-portal/primary/payment-method-add';
import PaymentMethodList from 'calypso/jetpack-cloud/sections/partner-portal/primary/payment-method-list';
import Prices from 'calypso/jetpack-cloud/sections/partner-portal/primary/prices';
import TermsOfServiceConsent from 'calypso/jetpack-cloud/sections/partner-portal/primary/terms-of-service-consent';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import NewJetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import NewPurchasesSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/purchases';
import { addQueryArgs } from 'calypso/lib/route';
import {
	getCurrentPartner,
	hasActivePartnerKey,
	doesPartnerRequireAPaymentMethod,
} from 'calypso/state/partner-portal/partner/selectors';
import { ToSConsent } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import { setAllSitesSelected } from 'calypso/state/ui/actions/set-sites';
import Header from './header';
import WPCOMAtomicHosting from './primary/wpcom-atomic-hosting';
import type PageJS from 'page';

const isNewNavigationEnabled = isEnabled( 'jetpack/new-navigation' );

const setSidebar = ( context: PageJS.Context ): void => {
	if ( isNewNavigationEnabled ) {
		context.secondary = <NewPurchasesSidebar />;
	} else {
		context.secondary = <PartnerPortalSidebar path={ context.path } />;
	}
};

export function allSitesContext( context: PageJS.Context, next: () => void ): void {
	// Many (if not all) Partner Portal pages do not select any one specific site
	context.store.dispatch( setAllSitesSelected() );
	next();
}

export function partnerContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.primary = <PartnerAccess />;
	next();
}

export function termsOfServiceContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.primary = <TermsOfServiceConsent />;
	next();
}

export function partnerKeyContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.primary = <LicenseSelectPartnerKey />;
	next();
}

export function billingDashboardContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <BillingDashboard />;
	next();
}

export function licensesContext( context: PageJS.Context, next: () => void ): void {
	const { s: search, sort_field, sort_direction, page } = context.query;
	const filter = publicToInternalLicenseFilter( context.params.filter, LicenseFilter.NotRevoked );
	const currentPage = parseInt( page ) || 1;
	const sortField = publicToInternalLicenseSortField( sort_field, LicenseSortField.IssuedAt );
	const sortDirection = valueToEnum< LicenseSortDirection >(
		LicenseSortDirection,
		sort_direction,
		LicenseSortDirection.Descending
	);

	context.header = <Header />;
	if ( isEnabled( 'jetpack/new-navigation' ) ) {
		context.secondary = <NewJetpackManageSidebar />;
	} else {
		context.secondary = <PartnerPortalSidebar path={ context.path } />;
	}
	context.primary = (
		<Licenses
			filter={ filter }
			search={ search || '' }
			currentPage={ currentPage }
			sortDirection={ sortDirection }
			sortField={ sortField }
		/>
	);
	next();
}

export function issueLicenseContext( context: PageJS.Context, next: () => void ): void {
	const { site_id: siteId, product_slug: suggestedProduct } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const selectedSite = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
	context.header = <Header />;
	setSidebar( context );
	context.primary = (
		<IssueLicense selectedSite={ selectedSite } suggestedProduct={ suggestedProduct } />
	);
	next();
}

export function downloadProductsContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <DownloadProducts />;
	next();
}

export function assignLicenseContext( context: PageJS.Context, next: () => void ): void {
	const { page, search } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const currentPage = parseInt( page ) || 1;

	context.header = <Header />;
	setSidebar( context );
	context.primary = (
		<AssignLicense sites={ sites } currentPage={ currentPage } search={ search || '' } />
	);
	next();
}

export function paymentMethodListContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <PaymentMethodList />;
	next();
}

export function paymentMethodAddContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );

	const { site_id: siteId } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const selectedSite = siteId ? sites?.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
	context.primary = <PaymentMethodAdd selectedSite={ selectedSite } />;
	next();
}

export function invoicesDashboardContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <InvoicesDashboard />;
	next();
}

export function companyDetailsDashboardContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <CompanyDetailsDashboard />;
	next();
}

export function pricesContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <Prices />;
	next();
}

export function landingPageContext() {
	page.redirect( isNewNavigationEnabled ? '/partner-portal/billing' : '/partner-portal/licenses' );
	return;
}

export function wpcomAtomicHostingContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <WPCOMAtomicHosting />;
	next();
}

/**
 * Require the user to have a partner with at least 1 active partner key.
 * @param {PageJS.Context} context PageJS context.
 * @param {() => void} next Next context callback.
 */
export function requireAccessContext( context: PageJS.Context, next: () => void ): void {
	const state = context.store.getState();
	const partner = getCurrentPartner( state );
	const { pathname, search } = window.location;

	if ( partner ) {
		next();
		return;
	}

	page.redirect(
		addQueryArgs(
			{
				return: ensurePartnerPortalReturnUrl( pathname + search ),
			},
			'/partner-portal/partner'
		)
	);
}

/**
 * Require the user to have consented to the terms of service.
 * @param {PageJS.Context} context PageJS context.
 * @param {() => void} next Next context callback.
 */
export function requireTermsOfServiceConsentContext(
	context: PageJS.Context,
	next: () => void
): void {
	const { pathname, search } = window.location;
	const state = context.store.getState();
	const partner = getCurrentPartner( state );

	if ( partner && partner.tos !== ToSConsent.NotConsented ) {
		next();
		return;
	}

	const returnUrl = ensurePartnerPortalReturnUrl( pathname + search );

	page.redirect(
		addQueryArgs(
			{
				return: returnUrl,
			},
			'/partner-portal/terms-of-service'
		)
	);
}

/**
 * Require the user to have selected a partner key to use.
 * @param {PageJS.Context} context PageJS context.
 * @param {() => void} next Next context callback.
 */
export function requireSelectedPartnerKeyContext(
	context: PageJS.Context,
	next: () => void
): void {
	const state = context.store.getState();
	const hasKey = hasActivePartnerKey( state );
	const { pathname, search } = window.location;

	if ( hasKey ) {
		next();
		return;
	}

	const returnUrl = ensurePartnerPortalReturnUrl( pathname + search );

	page.redirect(
		addQueryArgs(
			{
				return: returnUrl,
			},
			'/partner-portal/partner-key'
		)
	);
}

/**
 * Require the user to have a valid payment method registered.
 * @param {PageJS.Context} context PageJS context.
 * @param {() => void} next Next context callback.
 */
export function requireValidPaymentMethod( context: PageJS.Context, next: () => void ) {
	const state = context.store.getState();
	const paymentMethodRequired = doesPartnerRequireAPaymentMethod( state );
	const { pathname, search } = window.location;

	if ( paymentMethodRequired ) {
		const returnUrl = ensurePartnerPortalReturnUrl( pathname + search );

		page.redirect(
			addQueryArgs(
				{
					return: returnUrl,
				},
				'/partner-portal/payment-methods/add'
			)
		);
		return;
	}

	next();
}

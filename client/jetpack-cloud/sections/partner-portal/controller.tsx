import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback, type Context } from '@automattic/calypso-router';
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
import TermsOfServiceConsent from 'calypso/jetpack-cloud/sections/partner-portal/primary/terms-of-service-consent';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import PurchasesSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/purchases';
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
import PaymentMethodAddV2 from './primary/payment-method-add-v2';
import PaymentMethodListV2 from './primary/payment-methods-v2';
import WPCOMAtomicHosting from './primary/wpcom-atomic-hosting';

const isNewCardAdditionEnabled = isEnabled( 'jetpack/card-addition-improvements' );

const setSidebar = ( context: Context, isLicenseContext: boolean = false ): void => {
	context.secondary = isLicenseContext ? (
		<JetpackManageSidebar path={ context.path } />
	) : (
		<PurchasesSidebar path={ context.path } />
	);
};

export const allSitesContext: Callback = ( context, next ) => {
	// Many (if not all) Partner Portal pages do not select any one specific site
	context.store.dispatch( setAllSitesSelected() );
	next();
};

export const partnerContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.primary = <PartnerAccess />;
	next();
};

export const termsOfServiceContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.primary = <TermsOfServiceConsent />;
	next();
};

export const partnerKeyContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.primary = <LicenseSelectPartnerKey />;
	next();
};

export const billingDashboardContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <BillingDashboard />;
	next();
};

export const licensesContext: Callback = ( context, next ) => {
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
	setSidebar( context, true );
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
};

export const issueLicenseContext: Callback = ( context, next ) => {
	const { site_id: siteId, product_slug: suggestedProduct } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const selectedSite = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
	context.header = <Header />;
	setSidebar( context, true );
	context.primary = (
		<IssueLicense selectedSite={ selectedSite } suggestedProduct={ suggestedProduct } />
	);
	next();
};

export const downloadProductsContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <DownloadProducts />;
	next();
};

export const assignLicenseContext: Callback = ( context, next ) => {
	const { page, search } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const currentPage = parseInt( page ) || 1;

	context.header = <Header />;
	setSidebar( context, true );
	context.primary = (
		<AssignLicense sites={ sites } currentPage={ currentPage } search={ search || '' } />
	);
	next();
};

export const paymentMethodListContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = isNewCardAdditionEnabled ? <PaymentMethodListV2 /> : <PaymentMethodList />;
	next();
};

export const paymentMethodAddContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );

	const { site_id: siteId } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const selectedSite = siteId ? sites?.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
	context.primary = isNewCardAdditionEnabled ? (
		<PaymentMethodAddV2 withAssignLicense={ ! selectedSite } />
	) : (
		<PaymentMethodAdd selectedSite={ selectedSite } />
	);
	next();
};

export const invoicesDashboardContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <InvoicesDashboard />;
	next();
};

export const companyDetailsDashboardContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <CompanyDetailsDashboard />;
	next();
};

export const pricesContext: Callback = () => {
	page.redirect( '/partner-portal/issue-license' );
};

export const landingPageContext: Callback = () => {
	page.redirect( '/partner-portal/billing' );
};

export const wpcomAtomicHostingContext: Callback = ( context, next ) => {
	context.header = <Header />;
	setSidebar( context );
	context.primary = <WPCOMAtomicHosting />;
	next();
};

/**
 * Require the user to have a partner with at least 1 active partner key.
 */
export const requireAccessContext: Callback = ( context, next ) => {
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
};

/**
 * Require the user to have consented to the terms of service.
 */
export const requireTermsOfServiceConsentContext: Callback = ( context, next ) => {
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
};

/**
 * Require the user to have selected a partner key to use.
 */
export const requireSelectedPartnerKeyContext: Callback = ( context, next ) => {
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
};

/**
 * Require the user to have a valid payment method registered.
 */
export const requireValidPaymentMethod: Callback = ( context, next ) => {
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
};

import page from 'page';
import AgencyBilling from 'calypso/agency/billing';
import AgencyCompanyDetails from 'calypso/agency/company-details';
import AgencyDashboard from 'calypso/agency/dashboard';
import AgencyInvoices from 'calypso/agency/invoices';
import AgencyLicenses from 'calypso/agency/licenses';
import AgencyPaymentMethods from 'calypso/agency/payment-methods';
import AgencyPlugins from 'calypso/agency/plugins';
import AgencyPrices from 'calypso/agency/prices';
import AsyncLoad from 'calypso/components/async-load';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import {
	publicToInternalLicenseFilter,
	publicToInternalLicenseSortField,
	valueToEnum,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function sidebar( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		context.secondary = (
			<AsyncLoad require="calypso/agency/sidebar" path={ context.path } placeholder={ null } />
		);
	}

	next();
}

export function dashboardRedirect( context, next ) {
	page.redirect( `/agency/dashboard` );
	next();
}

export function dashboard( context, next ) {
	const { s: search, page: contextPage, issue_types, sort_field, sort_direction } = context.query;

	const currentPage = parseInt( contextPage ) || 1;

	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: context.params.filter === 'favorites',
	};

	const sort = {
		field: sort_field,
		direction: sort_direction,
	};

	context.primary = <AgencyDashboard { ...{ search, currentPage, filter, sort } } />;

	next();
}

export function plugins( context, next ) {
	const { filter = 'all', site } = context.params;
	const { s: search } = context.query;

	context.primary = <AgencyPlugins { ...{ filter, search, site } } />;

	next();
}

export function licenses( context, next ) {
	const { s: search, sort_field, sort_direction, page } = context.query;
	const filter = publicToInternalLicenseFilter( context.params.filter, LicenseFilter.NotRevoked );
	const currentPage = parseInt( page ) || 1;
	const sortField = publicToInternalLicenseSortField( sort_field, LicenseSortField.IssuedAt );
	const sortDirection = valueToEnum< LicenseSortDirection >(
		LicenseSortDirection,
		sort_direction,
		LicenseSortDirection.Descending
	);

	context.primary = (
		<AgencyLicenses { ...{ filter, search, currentPage, sortDirection, sortField } } />
	);

	next();
}

export function billing( context, next ) {
	context.primary = <AgencyBilling />;

	next();
}

export function paymentMethods( context, next ) {
	context.primary = <AgencyPaymentMethods />;

	next();
}

export function invoices( context, next ) {
	context.primary = <AgencyInvoices />;

	next();
}

export function prices( context, next ) {
	context.primary = <AgencyPrices />;

	next();
}

export function companyDetails( context, next ) {
	context.primary = <AgencyCompanyDetails />;

	next();
}

import page from '@automattic/calypso-router';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import PurchasesSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/purchases';
import {
	publicToInternalLicenseFilter,
	publicToInternalLicenseSortField,
	valueToEnum,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import BillingDashboard from './billing/billing-dashboard';
import CrmDownloads from './crm-downloads';
import InvoicesOverview from './invoices/invoices-overview';
import LicensesOverview from './licenses/licenses-overview';
import PaymentMethodAdd from './payment-methods/payment-method-add';
import PaymentMethodOverview from './payment-methods/payment-method-overview';

export const purchasesContext: Callback = () => {
	page.redirect( '/purchases/licenses' );
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
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker
				title="Purchases > Licenses"
				path={ context.path }
				properties={ { filter } }
			/>
			<LicensesOverview
				filter={ filter }
				search={ search || '' }
				currentPage={ currentPage }
				sortDirection={ sortDirection }
				sortField={ sortField }
			/>
		</>
	);

	next();
};

export const billingContext: Callback = ( context, next ) => {
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Purchases > Billing" path={ context.path } />
			<BillingDashboard />
		</>
	);

	next();
};

export const invoicesContext: Callback = ( context, next ) => {
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Purchases > Invoices" path={ context.path } />
			<InvoicesOverview />
		</>
	);

	next();
};

export const paymentMethodsContext: Callback = ( context, next ) => {
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Purchases > Payment methods" path={ context.path } />
			<PaymentMethodOverview />
		</>
	);

	next();
};

export const paymentMethodsAddContext: Callback = ( context, next ) => {
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Purchases > Payment methods > Add" path={ context.path } />
			<PaymentMethodAdd />
		</>
	);

	next();
};

export const crmDownloadsContext: Callback = ( context, next ) => {
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Purchases > Site > CRM Downloads" path={ context.path } />
			<CrmDownloads licenseKey={ context.params.licenseKey || '' } />
		</>
	);

	next();
};

import page from '@automattic/calypso-router';
import { type Callback } from '@automattic/calypso-router';
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
import LicensesOverview from './licenses/licenses-overview';

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
		<LicensesOverview
			filter={ filter }
			search={ search || '' }
			currentPage={ currentPage }
			sortDirection={ sortDirection }
			sortField={ sortField }
		/>
	);

	next();
};

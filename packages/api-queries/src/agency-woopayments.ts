import {
	fetchAgencyWooPaymentsData,
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { jetpackAgencyLicensesQuery } from './jetpack-agency-licenses';

export const WOOPAYMENTS_PLUGIN = 'woocommerce-payments/woocommerce-payments';

export const agencyWooPaymentsDataQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'woopayments', 'data' ],
		queryFn: () => fetchAgencyWooPaymentsData( agencyId ),
	} );

/**
 * The agency's attached WooPayments licenses. Canonical options shared by the
 * WooPayments dashboard and the overview store count, so both read the same
 * cache entry — diverging options would silently split the query keys.
 */
export const wooPaymentsLicensesQuery = ( agencyId: number ) =>
	jetpackAgencyLicensesQuery( agencyId, {
		filter: JetpackLicenseFilter.Attached,
		search: 'woopayments',
		sortField: JetpackLicenseSortField.IssuedAt,
		sortDirection: JetpackLicenseSortDirection.Descending,
	} );

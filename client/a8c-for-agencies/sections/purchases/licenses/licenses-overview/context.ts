import { createContext } from 'react';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { LicenseListContext as LicensesOverviewContext } from 'calypso/state/partner-portal/types';

const LicensesOverview = createContext< LicensesOverviewContext >( {
	currentPage: 1,
	search: '',
	filter: LicenseFilter.NotRevoked,
	sortField: LicenseSortField.IssuedAt,
	sortDirection: LicenseSortDirection.Descending,
} );

export default LicensesOverview;

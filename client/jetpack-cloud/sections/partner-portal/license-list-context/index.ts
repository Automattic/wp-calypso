import { createContext } from 'react';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { LicenseListContext as LicenseListContextInterface } from 'calypso/state/partner-portal/types';

const LicenseListContext = createContext< LicenseListContextInterface >( {
	currentPage: 1,
	search: '',
	filter: LicenseFilter.NotRevoked,
	sortField: LicenseSortField.IssuedAt,
	sortDirection: LicenseSortDirection.Descending,
} );

export default LicenseListContext;

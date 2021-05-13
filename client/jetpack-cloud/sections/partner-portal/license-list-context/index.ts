/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { LicenseListContext as LicenseListContextInterface } from 'calypso/state/partner-portal/types';

const LicenseListContext = React.createContext< LicenseListContextInterface >( {
	currentPage: 1,
	search: '',
	filter: LicenseFilter.NotRevoked,
	sortField: LicenseSortField.IssuedAt,
	sortDirection: LicenseSortDirection.Descending,
} );

export default LicenseListContext;

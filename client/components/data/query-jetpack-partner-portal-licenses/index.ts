/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';

interface Props {
	filter: LicenseFilter;
	search: string;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
	page: number;
}

export default function QueryJetpackPartnerPortalLicenses( {
	filter,
	search,
	sortField,
	sortDirection,
	page,
}: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchLicenses( filter, search, sortField, sortDirection, page ) );
	}, [ dispatch, filter, search, sortField, sortDirection, page ] );

	return null;
}

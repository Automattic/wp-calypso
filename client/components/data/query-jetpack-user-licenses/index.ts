import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { requestLicenses } from 'calypso/state/user-licensing/actions';
import { isFetchingUserLicenses } from 'calypso/state/user-licensing/selectors';

interface Props {
	filter?: LicenseFilter;
	search?: string;
	sortField?: LicenseSortField;
	sortDirection?: LicenseSortDirection;
	page?: number;
}

export default function QueryJetpackUserLicenses( {
	filter,
	search,
	sortField,
	sortDirection,
	page,
}: Props ): null {
	const dispatch = useDispatch();
	const currentlyFetchingUserLicenses = useSelector( isFetchingUserLicenses );

	useEffect( () => {
		if ( ! currentlyFetchingUserLicenses ) {
			dispatch( requestLicenses( filter, search, sortField, sortDirection, page ) );
		}
	}, [ dispatch, currentlyFetchingUserLicenses, filter, search, sortField, sortDirection, page ] );

	return null;
}

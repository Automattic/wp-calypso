/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';

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
	const activeKeyId = useSelector( getActivePartnerKeyId );

	useEffect( () => {
		// Key switching for requests is already done for us - we use activeKeyId just to re-trigger the request.
		dispatch( fetchLicenses( filter, search, sortField, sortDirection, page ) );
	}, [ dispatch, activeKeyId, filter, search, sortField, sortDirection, page ] );

	return null;
}

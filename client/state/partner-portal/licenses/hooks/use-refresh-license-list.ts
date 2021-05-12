/**
 * External dependencies
 */
import { Context, useContext } from 'react';

/**
 * Internal dependencies
 */
import { LicenseListContext, PartnerPortalThunkAction } from 'calypso/state/partner-portal/types';
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';

export default function useRefreshLicenseList(
	context: Context< LicenseListContext >
): () => PartnerPortalThunkAction {
	const { filter, search, sortField, sortDirection, currentPage } = useContext( context );

	return () => fetchLicenses( filter, search, sortField, sortDirection, currentPage );
}

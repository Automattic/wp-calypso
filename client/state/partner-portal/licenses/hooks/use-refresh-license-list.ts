import { Context, useContext } from 'react';
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';
import { LicenseListContext, PartnerPortalThunkAction } from 'calypso/state/partner-portal/types';

export default function useRefreshLicenseList(
	context: Context< LicenseListContext >
): () => PartnerPortalThunkAction {
	const { filter, search, sortField, sortDirection, currentPage } = useContext( context );

	return () => fetchLicenses( filter, search, sortField, sortDirection, currentPage );
}

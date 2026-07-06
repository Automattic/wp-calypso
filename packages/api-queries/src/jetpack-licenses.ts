import { fetchJetpackLicenses } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchJetpackLicensesOptions } from '@automattic/api-core';

export const jetpackLicensesQuery = ( agencyId: number, options: FetchJetpackLicensesOptions ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'jetpack-licenses', options ],
		queryFn: () => fetchJetpackLicenses( agencyId, options ),
	} );

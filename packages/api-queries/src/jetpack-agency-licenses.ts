import { fetchJetpackLicenses } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchJetpackLicensesOptions } from '@automattic/api-core';

export const jetpackAgencyLicensesQuery = (
	agencyId: number,
	options: FetchJetpackLicensesOptions
) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'jetpack-agency-licenses', options ],
		queryFn: () => fetchJetpackLicenses( agencyId, options ),
	} );

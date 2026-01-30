import { fetchJetpackUserLicense } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const jetpackUserLicenseQuery = ( subscriptionId: number ) =>
	queryOptions( {
		queryKey: [ 'jetpack-user-license', subscriptionId ],
		queryFn: () => fetchJetpackUserLicense( subscriptionId ),
	} );

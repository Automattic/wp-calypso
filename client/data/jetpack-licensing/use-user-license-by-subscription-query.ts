import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { mapSingleLicenseApiToLicense } from './utils';
import type { UserLicenseApi, UserLicense } from './types';

const useUserLicenseBySubscriptionQuery = (
	subscriptionId: number
): UseQueryResult< UserLicense > => {
	const queryKey = [ 'user-license', subscriptionId ];
	return useQuery< UserLicenseApi, Error, UserLicense >( {
		queryKey,
		queryFn: async () =>
			wpcom.req.get( {
				path: `/jetpack-licensing/user/subscription/${ subscriptionId }`,
				apiNamespace: 'wpcom/v2',
			} ),
		select: mapSingleLicenseApiToLicense,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
	} );
};

export default useUserLicenseBySubscriptionQuery;

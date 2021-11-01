import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { mapManyLicenseApiToLicense } from './utils';
import type { UserLicenseApi, UserLicense } from './types';

const useUserLicenseByReceiptQuery = ( receiptId: number ): UseQueryResult< UserLicense[] > => {
	const queryKey = [ 'user-license', receiptId ];
	return useQuery< UserLicenseApi[], unknown, UserLicense[] >(
		queryKey,
		async () =>
			wpcom.req.get( {
				path: `/jetpack-licensing/user/receipt/${ receiptId }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: mapManyLicenseApiToLicense,
			refetchIntervalInBackground: false,
			refetchOnWindowFocus: false,
		}
	);
};

export default useUserLicenseByReceiptQuery;

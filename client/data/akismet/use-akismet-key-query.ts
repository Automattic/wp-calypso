import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useAkismetKeyQuery = (): UseQueryResult< string > => {
	const queryKey = [ 'me', 'akismet-key' ];
	return useQuery( {
		queryKey,
		queryFn: async () =>
			wpcom.req.get( {
				path: '/akismet/get-key',
				apiNamespace: 'wpcom/v2',
			} ),
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
	} );
};

export default useAkismetKeyQuery;

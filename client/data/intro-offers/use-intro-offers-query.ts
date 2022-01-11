import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface Options {
	enabled?: boolean;
}

const useIntroOffersQuery = (
	siteId: number | null,
	{ enabled = true }: Options = {}
): UseQueryResult => {
	return useQuery(
		getCacheKey( siteId ),
		() => wpcom.req.get( `/sites/${ siteId }/intro-offers`, { apiNamespace: 'wpcom/v2' } ),
		{
			enabled: !! siteId && enabled,
			staleTime: Infinity,
			refetchInterval: false,
			refetchOnMount: 'always',
		}
	);
};

export function getCacheKey( siteId: number | null ): QueryKey {
	return [ 'intro-offers', siteId ];
}

export default useIntroOffersQuery;

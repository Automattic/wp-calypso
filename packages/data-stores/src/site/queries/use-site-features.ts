import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { SiteFeatures } from '../types';

interface Props {
	siteIdOrSlug: string | number | null | undefined;
}

/**
 * Site details from `/sites/[ siteIdOrSlug ]/features` endpoint
 */
function useSiteFeatures( { siteIdOrSlug }: Props ): UseQueryResult< SiteFeatures | undefined > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.siteFeatures( siteIdOrSlug ),
		queryFn: async (): Promise< SiteFeatures | undefined > => {
			return await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteIdOrSlug as string ) }/features`,
				apiVersion: '1.1',
			} );
		},
		enabled: !! siteIdOrSlug,
	} );
}

export default useSiteFeatures;

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { SiteDetails } from '../types';

interface Props {
	siteIdOrSlug: string | number | null | undefined;
}

/**
 * Site details from `/sites/[ siteId ]` endpoint
 */
function useSite( { siteIdOrSlug }: Props ): UseQueryResult< SiteDetails | undefined > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.site( siteIdOrSlug ),
		queryFn: async (): Promise< SiteDetails | undefined > => {
			return await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteIdOrSlug as string ) }`,
				apiVersion: '1.1',
			} );
		},
		enabled: !! siteIdOrSlug,
	} );
}

export default useSite;

import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse, SiteVerticalQueryByIdParams } from './types';

const useSiteVerticalQueryById = ( id: string ): UseQueryResult< SiteVerticalsResponse > => {
	return useQuery( getCacheKey( id ), () => fetchSiteVertical( { id } ), {
		enabled: typeof id === 'string' && id !== '',
		staleTime: Infinity,
		refetchInterval: false,
		refetchOnMount: 'always',
	} );
};

export function fetchSiteVertical(
	params: SiteVerticalQueryByIdParams
): Promise< SiteVerticalsResponse > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/site-verticals/${ params.id }`,
	} );
}

export function getCacheKey( id: string ): QueryKey {
	return [ 'site-vertical', 'by-id', id ];
}

export default useSiteVerticalQueryById;

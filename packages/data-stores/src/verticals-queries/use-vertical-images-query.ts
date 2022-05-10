import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { VerticalImage } from './types';

export function useVerticalImagesQuery( id: string ): UseQueryResult< VerticalImage[] > {
	return useQuery( getCacheKey( id ), () => fetchVerticalImages( id ), {
		enabled: typeof id === 'string' && id !== '',
		staleTime: Infinity,
	} );
}

function fetchVerticalImages( id: string ): Promise< VerticalImage[] > {
	return wpcomRequest< VerticalImage[] >( {
		apiNamespace: 'wpcom/v2',
		path: `/site-verticals/${ id }/images`,
		query: stringify( { include_parents: true } ),
	} );
}

function getCacheKey( id: string ): QueryKey {
	return [ 'vertical-images', id ];
}

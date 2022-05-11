import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { VerticalImage } from './types';

const defaults = {
	limit: 10,
	include_parents: true,
};

interface VerticalImagesQueryParams {
	limit?: number;
	include_parents?: boolean;
}

export function useVerticalImagesQuery(
	id: string,
	options: VerticalImagesQueryParams = {}
): UseQueryResult< VerticalImage[] > {
	return useQuery( getCacheKey( id ), () => fetchVerticalImages( id, options ), {
		enabled: typeof id === 'string' && id !== '',
		staleTime: Infinity,
	} );
}

function fetchVerticalImages(
	id: string,
	options: VerticalImagesQueryParams
): Promise< VerticalImage[] > {
	return wpcomRequest< VerticalImage[] >( {
		apiNamespace: 'wpcom/v2',
		path: `/site-verticals/${ id }/images`,
		query: stringify( { ...defaults, ...options } ),
	} );
}

function getCacheKey( id: string ): QueryKey {
	return [ 'vertical-images', id ];
}

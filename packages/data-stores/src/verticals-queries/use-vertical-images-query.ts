import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import type { VerticalImage } from './types';

export function useVerticalImagesQuery( id: string ): UseQueryResult< VerticalImage[] > {
	return useQuery( getCacheKey( id ), () => fetchVerticalImages( id ), {
		enabled: typeof id === 'string' && id !== '',
		staleTime: Infinity,
	} );
}

function fetchVerticalImages( id: string ): Promise< VerticalImage[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/site-verticals/${ id }/images`,
	} );
}

function getCacheKey( id: string ): QueryKey {
	return [ 'vertical-images', id ];
}

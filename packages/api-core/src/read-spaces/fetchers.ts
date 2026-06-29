import { wpcom } from '../wpcom-fetcher';
import { adaptReadSpace, adaptReadSpaceDetails, type ReadSpaceApiItem } from './adapters';
import type { ReadSpace, ReadSpaceDetails } from './types';

/**
 * Fetch the current user's spaces from the wpcom/v2 `GET /reader/spaces`
 * endpoint. The list is the slim summary shape (no sources or tags), adapted to
 * the client `ReadSpace` via `adaptReadSpace`.
 */
export async function fetchReadSpaces(): Promise< ReadSpace[] > {
	const response = await wpcom.req.get( {
		path: '/reader/spaces',
		apiNamespace: 'wpcom/v2',
	} );

	const items: ReadSpaceApiItem[] = Array.isArray( response ) ? response : [];
	return items.map( adaptReadSpace );
}

/**
 * Fetch a single space's detail (its followed feeds and tags) from the wpcom/v2
 * `GET /reader/spaces/{id}` endpoint, adapting the wire `follows` array onto the
 * client `sources` shape.
 */
export async function fetchReadSpace( spaceId: string ): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.get( {
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadSpaceDetails( item );
}

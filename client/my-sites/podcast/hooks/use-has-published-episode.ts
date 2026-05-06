import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const fetchHasPublishedEpisode = ( siteId: number, categoryId: number ): Promise< boolean > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{ path: `/sites/${ siteId }/posts`, apiNamespace: 'wp/v2' },
			{
				categories: String( categoryId ),
				per_page: 1,
				status: 'publish',
				_fields: 'id',
			},
			( error: Error | null, data: { id: number }[] = [] ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( Array.isArray( data ) && data.length > 0 );
			}
		);
	} );

/**
 * Returns whether the podcast category has at least one published post.
 * Resolves to `undefined` while loading or when inputs aren't ready, so callers
 * can distinguish "no episodes" from "haven't checked yet".
 */
export const useHasPublishedEpisode = (
	siteId: number | null | undefined,
	categoryId: number
): boolean | undefined => {
	const { data } = useQuery< boolean >( {
		queryKey: [ 'podcast-has-published-episode', siteId, categoryId ],
		queryFn: () => fetchHasPublishedEpisode( siteId as number, categoryId ),
		enabled: !! siteId && !! categoryId,
	} );
	return data;
};

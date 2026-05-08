import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type EpisodeStats = {
	post_id: number;
	plays_7d: number;
	plays_30d: number;
	plays_90d: number;
	plays_all: number;
	// Added in the duration follow-up to episode-totals. Null when the post
	// has no resolvable audio attachment or the attachment lacks metadata.
	duration_seconds?: number | null;
};

type Response = {
	episodes: EpisodeStats[];
};

// The endpoint accepts up to 50 post_ids per request.
const CHUNK_SIZE = 50;

const fetchChunk = ( siteId: number, postIds: number[] ): Promise< Response > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: `/sites/${ siteId }/podcast-stats/episode-totals`,
				apiNamespace: 'wpcom/v2',
			},
			{ post_ids: postIds.join( ',' ) },
			( error: Error | null, data: Response ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( data );
			}
		);
	} );

const useEpisodeStatsQuery = ( siteId: number | null | undefined, postIds: readonly number[] ) => {
	return useQuery< Map< number, EpisodeStats > >( {
		queryKey: [
			'podcast-episode-stats',
			siteId,
			postIds.length,
			[ ...postIds ].sort( ( a, b ) => a - b ).join( ',' ),
		],
		queryFn: async () => {
			const map = new Map< number, EpisodeStats >();
			if ( ! siteId || postIds.length === 0 ) {
				return map;
			}
			const chunks: number[][] = [];
			for ( let i = 0; i < postIds.length; i += CHUNK_SIZE ) {
				chunks.push( [ ...postIds ].slice( i, i + CHUNK_SIZE ) );
			}
			const responses = await Promise.all( chunks.map( ( chunk ) => fetchChunk( siteId, chunk ) ) );
			for ( const res of responses ) {
				for ( const stats of res.episodes ?? [] ) {
					map.set( stats.post_id, stats );
				}
			}
			return map;
		},
		enabled: !! siteId && postIds.length > 0,
		staleTime: 5 * 60 * 1000, // server-side cache TTL is 5 min
	} );
};

export default useEpisodeStatsQuery;

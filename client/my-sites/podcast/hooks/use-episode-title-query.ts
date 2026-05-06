import { useQuery } from '@tanstack/react-query';
import { decodeEntities } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { getMockEpisodeTitle, isPodcastStatsMockEnabled } from './use-show-stats-query';

type EpisodePostResponse = {
	title?: {
		rendered?: string;
	};
};

const requestEpisodeTitle = ( siteId: number, postId: number ): Promise< string > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: `/sites/${ siteId }/posts/${ postId }`,
				apiNamespace: 'wp/v2',
			},
			{},
			( error: Error | null, data: EpisodePostResponse ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( decodeEntities( data?.title?.rendered ?? '' ) );
			}
		);
	} );

const useEpisodeTitleQuery = (
	siteId: number | null | undefined,
	postId: number | null | undefined
) => {
	const isMockEnabled = isPodcastStatsMockEnabled();

	return useQuery< string >( {
		queryKey: [ 'podcast-episode-title', siteId, postId, isMockEnabled ],
		queryFn: () => {
			if ( isMockEnabled ) {
				return Promise.resolve( getMockEpisodeTitle( postId as number ) );
			}
			return requestEpisodeTitle( siteId as number, postId as number );
		},
		enabled: ( isMockEnabled || !! siteId ) && !! postId,
		staleTime: 5 * 60 * 1000,
	} );
};

export default useEpisodeTitleQuery;

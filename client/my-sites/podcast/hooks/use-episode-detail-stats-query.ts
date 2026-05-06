import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	getStatsDateRange,
	type PodcastStatsAppRow,
	type PodcastStatsCountryRow,
	type PodcastStatsPeriod,
	type PodcastStatsRange,
	type PodcastStatsTopDay,
} from './use-show-stats-query';

export type PodcastEpisodeDetailStats = {
	range: PodcastStatsRange;
	total_plays: number;
	by_day: Record< string, number >;
	by_app: PodcastStatsAppRow[];
	by_country: PodcastStatsCountryRow[];
	first_play_date: string | null;
	top_day: PodcastStatsTopDay | null;
	period: PodcastStatsPeriod;
};

const requestEpisodeStats = (
	siteId: number,
	postId: number,
	range: PodcastStatsRange
): Promise< Omit< PodcastEpisodeDetailStats, 'period' > > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: `/sites/${ siteId }/podcast-stats/episode/${ postId }`,
				apiNamespace: 'wpcom/v2',
			},
			{
				from: range.from,
				to: range.to,
			},
			( error: Error | null, data: Omit< PodcastEpisodeDetailStats, 'period' > ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( data );
			}
		);
	} );

const useEpisodeDetailStatsQuery = (
	siteId: number | null | undefined,
	postId: number | null | undefined,
	period: PodcastStatsPeriod = '30d'
) => {
	const range = getStatsDateRange( period );

	return useQuery< PodcastEpisodeDetailStats >( {
		queryKey: [ 'podcast-episode-detail-stats', siteId, postId, period, range ],
		queryFn: async () => {
			const data = await requestEpisodeStats( siteId as number, postId as number, range );
			return {
				...data,
				period,
			};
		},
		enabled: !! siteId && !! postId,
		staleTime: 5 * 60 * 1000,
	} );
};

export default useEpisodeDetailStatsQuery;

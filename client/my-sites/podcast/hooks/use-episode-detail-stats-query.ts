import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	buildMockShowStats,
	getStatsDateRange,
	isPodcastStatsMockEnabled,
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

const buildMockEpisodeStats = (
	postId: number,
	range: PodcastStatsRange,
	period: PodcastStatsPeriod
): PodcastEpisodeDetailStats => {
	const showStats = buildMockShowStats( range, period, 10 );
	const scale = 0.12 + ( postId % 5 ) * 0.035;
	const byDay = Object.entries( showStats.by_day ).reduce< Record< string, number > >(
		( output, [ date, plays ], index ) => {
			output[ date ] = Math.max( 0, Math.round( plays * scale ) + ( index % 13 === 0 ? 12 : 0 ) );
			return output;
		},
		{}
	);
	const totalPlays = Object.values( byDay ).reduce( ( sum, plays ) => sum + plays, 0 );
	const topDayEntry = Object.entries( byDay ).reduce(
		( best, current ) => ( current[ 1 ] > best[ 1 ] ? current : best ),
		[ '', 0 ]
	);

	return {
		range,
		total_plays: totalPlays,
		by_day: byDay,
		by_app: showStats.by_app.map( ( row ) => ( {
			...row,
			plays: Math.round( row.plays * scale ),
		} ) ),
		by_country: showStats.by_country.map( ( row ) => ( {
			...row,
			plays: Math.round( row.plays * scale ),
		} ) ),
		first_play_date: range.from,
		top_day: topDayEntry[ 0 ] ? { date: topDayEntry[ 0 ], plays: topDayEntry[ 1 ] } : null,
		period,
	};
};

const useEpisodeDetailStatsQuery = (
	siteId: number | null | undefined,
	postId: number | null | undefined,
	period: PodcastStatsPeriod = '30d'
) => {
	const range = getStatsDateRange( period );
	const isMockEnabled = isPodcastStatsMockEnabled();

	return useQuery< PodcastEpisodeDetailStats >( {
		queryKey: [ 'podcast-episode-detail-stats', siteId, postId, period, range, isMockEnabled ],
		queryFn: async () => {
			if ( isMockEnabled ) {
				return buildMockEpisodeStats( postId as number, range, period );
			}
			const data = await requestEpisodeStats( siteId as number, postId as number, range );
			return {
				...data,
				period,
			};
		},
		enabled: ( isMockEnabled || !! siteId ) && !! postId,
		staleTime: 5 * 60 * 1000,
	} );
};

export default useEpisodeDetailStatsQuery;

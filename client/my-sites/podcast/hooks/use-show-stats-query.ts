import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type PodcastStatsPeriod = '7d' | '30d' | '90d' | 'all';

export type PodcastStatsRange = {
	from: string;
	to: string;
};

export type PodcastStatsAppRow = {
	app: string;
	plays: number;
	pct: number;
};

export type PodcastStatsCountryRow = {
	country: string;
	plays: number;
	pct: number;
};

export type PodcastStatsTopEpisode = {
	post_id: number;
	title: string;
	plays: number;
};

export type PodcastStatsTopDay = {
	date: string;
	plays: number;
};

export type PodcastStatsSummaryResponse = {
	range: PodcastStatsRange;
	total_plays: number;
	by_day: Record< string, number >;
	by_app: PodcastStatsAppRow[];
	by_country: PodcastStatsCountryRow[];
	top_episodes: PodcastStatsTopEpisode[];
};

export type PodcastStatsOverviewResponse = {
	totals: {
		last_7_days: {
			plays: number;
			delta_pct: number | null;
		};
		last_30_days: {
			plays: number;
			delta_pct: number | null;
		};
		last_90_days: {
			plays: number;
			delta_pct: number | null;
		};
		all_time: {
			plays: number;
		};
	};
	top_day: PodcastStatsTopDay | null;
	by_app: PodcastStatsAppRow[];
	by_country: PodcastStatsCountryRow[];
	top_episodes: PodcastStatsTopEpisode[];
};

export type PodcastShowStats = PodcastStatsSummaryResponse & {
	period: PodcastStatsPeriod;
	isAllTime: boolean;
	overview?: PodcastStatsOverviewResponse;
};

const ALL_TIME_CHART_DAYS = 365;
const DEFAULT_TOP_LIMIT = 10;
const PERIOD_DAYS: Record< PodcastStatsPeriod, number > = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
	all: ALL_TIME_CHART_DAYS,
};

const toUtcDateString = ( date: Date ) => date.toISOString().slice( 0, 10 );

const subtractUtcDays = ( date: Date, days: number ) => {
	const next = new Date( date );
	next.setUTCDate( next.getUTCDate() - days );
	return next;
};

export const getStatsDateRange = ( period: PodcastStatsPeriod ): PodcastStatsRange => {
	const toDate = new Date();
	const to = toUtcDateString( toDate );
	const days = PERIOD_DAYS[ period ];
	const from = toUtcDateString( subtractUtcDays( toDate, days - 1 ) );

	return { from, to };
};

const requestPodcastStats = < T >(
	path: string,
	query: Record< string, string | number > = {}
): Promise< T > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path,
				apiNamespace: 'wpcom/v2',
			},
			query,
			( error: Error | null, data: T ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( data );
			}
		);
	} );

const fetchSummary = (
	siteId: number,
	range: PodcastStatsRange,
	limit: number
): Promise< PodcastStatsSummaryResponse > =>
	requestPodcastStats< PodcastStatsSummaryResponse >( `/sites/${ siteId }/podcast-stats`, {
		from: range.from,
		to: range.to,
		limit,
	} );

const fetchOverview = ( siteId: number, limit: number ): Promise< PodcastStatsOverviewResponse > =>
	requestPodcastStats< PodcastStatsOverviewResponse >(
		`/sites/${ siteId }/podcast-stats/overview`,
		{
			limit,
		}
	);

const getOverviewTotal = ( overview: PodcastStatsOverviewResponse, period: PodcastStatsPeriod ) => {
	if ( period === '7d' ) {
		return overview.totals.last_7_days.plays;
	}
	if ( period === '30d' ) {
		return overview.totals.last_30_days.plays;
	}
	if ( period === '90d' ) {
		return overview.totals.last_90_days.plays;
	}
	return overview.totals.all_time.plays;
};

const normalizeStats = (
	summary: PodcastStatsSummaryResponse,
	overview: PodcastStatsOverviewResponse,
	period: PodcastStatsPeriod
): PodcastShowStats => ( {
	...summary,
	total_plays: getOverviewTotal( overview, period ),
	period,
	isAllTime: period === 'all',
	overview,
} );

const useShowStatsQuery = (
	siteId: number | null | undefined,
	period: PodcastStatsPeriod = '30d',
	limit = DEFAULT_TOP_LIMIT
) => {
	const range = getStatsDateRange( period );

	return useQuery< PodcastShowStats >( {
		queryKey: [ 'podcast-show-stats', siteId, period, range, limit ],
		queryFn: async () => {
			const resolvedSiteId = siteId as number;
			const [ overview, summary ] = await Promise.all( [
				fetchOverview( resolvedSiteId, limit ),
				fetchSummary( resolvedSiteId, range, limit ),
			] );
			return normalizeStats( summary, overview, period );
		},
		enabled: !! siteId,
		staleTime: 5 * 60 * 1000,
	} );
};

export default useShowStatsQuery;

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
	episodes_published?: number;
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

export const isPodcastStatsMockEnabled = () => {
	if ( process.env.NODE_ENV === 'production' || typeof window === 'undefined' ) {
		return false;
	}
	const value = new URLSearchParams( window.location.search ).get( 'podcastStatsMock' );
	return value !== null && value !== '0' && value !== 'false';
};

export const getPodcastStatsMockQueryString = () =>
	isPodcastStatsMockEnabled() ? '?podcastStatsMock=1' : '';

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

const getDatesInRange = ( range: PodcastStatsRange ) => {
	const dates: string[] = [];
	const cursor = new Date( `${ range.from }T00:00:00Z` );
	const end = new Date( `${ range.to }T00:00:00Z` );
	while ( cursor <= end ) {
		dates.push( toUtcDateString( cursor ) );
		cursor.setUTCDate( cursor.getUTCDate() + 1 );
	}
	return dates;
};

const buildMockByDay = ( range: PodcastStatsRange, seed = 0 ) => {
	return getDatesInRange( range ).reduce< Record< string, number > >( ( byDay, date, index ) => {
		const wave = ( index * 17 + seed ) % 31;
		const weekendLift = index % 7 === 5 || index % 7 === 6 ? 18 : 0;
		const launchSpike = index % 19 === 0 ? 95 : 0;
		const episodeSpike = index % 11 === 3 ? 58 : 0;
		byDay[ date ] = 18 + wave + weekendLift + launchSpike + episodeSpike;
		return byDay;
	}, {} );
};

const withPct = < T extends { plays: number } >( rows: T[] ) => {
	const total = rows.reduce( ( sum, row ) => sum + row.plays, 0 );
	return rows.map( ( row ) => ( {
		...row,
		pct: total > 0 ? Math.round( ( row.plays / total ) * 1000 ) / 10 : 0,
	} ) );
};

const getTopDay = ( byDay: Record< string, number > ): PodcastStatsTopDay | null => {
	const [ date, plays ] = Object.entries( byDay ).reduce(
		( best, current ) => ( current[ 1 ] > best[ 1 ] ? current : best ),
		[ '', 0 ]
	);
	return date ? { date, plays } : null;
};

const buildMockTopEpisodes = ( limit: number ): PodcastStatsTopEpisode[] =>
	[
		{ post_id: 1001, title: 'Episode 12: The Listener Mailbag', plays: 18420 },
		{ post_id: 1002, title: 'Episode 9: Field Notes From the Road', plays: 15280 },
		{ post_id: 1003, title: 'Episode 6: How the Story Changed', plays: 12840 },
		{ post_id: 1004, title: 'Episode 10: Season Finale - The Static Awakens', plays: 11990 },
		{ post_id: 1005, title: 'Episode 3: A Very Strange Signal', plays: 10360 },
		{ post_id: 1006, title: 'Episode 8: The Interview That Almost Got Away', plays: 8820 },
		{ post_id: 1007, title: 'Episode 5: Behind the Theme Music', plays: 7340 },
		{ post_id: 1008, title: 'Episode 11: Bonus Dispatch', plays: 5960 },
		{ post_id: 1009, title: 'Episode 2: Starting From Zero', plays: 4420 },
		{ post_id: 1010, title: 'Episode 1: Pilot', plays: 3180 },
	].slice( 0, limit );

export const getMockEpisodeTitle = ( postId: number ) =>
	buildMockTopEpisodes( DEFAULT_TOP_LIMIT ).find( ( episode ) => episode.post_id === postId )
		?.title || `Episode ${ postId }`;

const buildMockSummary = (
	range: PodcastStatsRange,
	limit: number
): PodcastStatsSummaryResponse => {
	const byDay = buildMockByDay( range );
	const totalPlays = Object.values( byDay ).reduce( ( sum, plays ) => sum + plays, 0 );
	return {
		range,
		total_plays: totalPlays,
		by_day: byDay,
		by_app: withPct( [
			{ app: 'apple', plays: Math.round( totalPlays * 0.38 ) },
			{ app: 'spotify', plays: Math.round( totalPlays * 0.27 ) },
			{ app: 'web', plays: Math.round( totalPlays * 0.14 ) },
			{ app: 'pocketcasts', plays: Math.round( totalPlays * 0.08 ) },
			{ app: 'overcast', plays: Math.round( totalPlays * 0.06 ) },
			{ app: 'castbox', plays: Math.round( totalPlays * 0.04 ) },
			{ app: 'other', plays: Math.round( totalPlays * 0.03 ) },
		] ),
		by_country: withPct( [
			{ country: 'US', plays: Math.round( totalPlays * 0.34 ) },
			{ country: 'GB', plays: Math.round( totalPlays * 0.16 ) },
			{ country: 'ES', plays: Math.round( totalPlays * 0.11 ) },
			{ country: 'BR', plays: Math.round( totalPlays * 0.09 ) },
			{ country: 'CA', plays: Math.round( totalPlays * 0.08 ) },
			{ country: 'AU', plays: Math.round( totalPlays * 0.07 ) },
			{ country: 'DE', plays: Math.round( totalPlays * 0.06 ) },
			{ country: 'MX', plays: Math.round( totalPlays * 0.05 ) },
			{ country: 'NL', plays: Math.round( totalPlays * 0.04 ) },
		] ),
		top_episodes: buildMockTopEpisodes( limit ),
	};
};

const buildMockOverview = (
	summary: PodcastStatsSummaryResponse
): PodcastStatsOverviewResponse => ( {
	totals: {
		last_7_days: { plays: 3820, delta_pct: 18.4 },
		last_30_days: { plays: summary.total_plays, delta_pct: 12.7 },
		last_90_days: { plays: Math.round( summary.total_plays * 2.8 ), delta_pct: 24.1 },
		all_time: { plays: 184260 },
	},
	top_day: getTopDay( summary.by_day ),
	by_app: summary.by_app,
	by_country: summary.by_country,
	top_episodes: summary.top_episodes,
} );

export const buildMockShowStats = (
	range: PodcastStatsRange,
	period: PodcastStatsPeriod,
	limit = DEFAULT_TOP_LIMIT
): PodcastShowStats => {
	const summary = buildMockSummary( range, limit );
	const overview = buildMockOverview( summary );
	return {
		...normalizeStats( summary, overview, period ),
		episodes_published: 42,
	};
};

const useShowStatsQuery = (
	siteId: number | null | undefined,
	period: PodcastStatsPeriod = '30d',
	limit = DEFAULT_TOP_LIMIT
) => {
	const range = getStatsDateRange( period );
	const isMockEnabled = isPodcastStatsMockEnabled();

	return useQuery< PodcastShowStats >( {
		queryKey: [ 'podcast-show-stats', siteId, period, range, limit, isMockEnabled ],
		queryFn: async () => {
			if ( isMockEnabled ) {
				return buildMockShowStats( range, period, limit );
			}
			const resolvedSiteId = siteId as number;
			const [ overview, summary ] = await Promise.all( [
				fetchOverview( resolvedSiteId, limit ),
				fetchSummary( resolvedSiteId, range, limit ),
			] );
			return normalizeStats( summary, overview, period );
		},
		enabled: isMockEnabled || !! siteId,
		staleTime: 5 * 60 * 1000,
	} );
};

export default useShowStatsQuery;

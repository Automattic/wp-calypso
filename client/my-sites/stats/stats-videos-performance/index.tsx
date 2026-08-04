import { useSelector } from 'calypso/state';
import {
	getVideoPressPlaysComplete,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { useShouldGateStats } from '../hooks/use-should-gate-stats';
import { aggregateVideoPerformance, flattenVideoPlaysRows } from './aggregate';
import VideosPerformanceCards from './cards';
import type { StatsQueryType, StatsStateProps } from '../features/modules/types';

const STAT_TYPE = 'statsVideoPlays';

export default function VideosPerformance( {
	siteId,
	query,
}: {
	siteId: number;
	query: StatsQueryType;
} ) {
	const isGated = useShouldGateStats( STAT_TYPE );
	// Relies on the videos list already querying with `complete_stats: 1` (set
	// in summary/index.jsx); flattenVideoPlaysRows reads the per-video
	// `days[*].data` shape that only that flag returns. Without it there are no
	// rows and the card hides itself below.
	const data = useSelector( ( state ) =>
		getVideoPressPlaysComplete( state, siteId, STAT_TYPE, query )
	);
	const isRequesting = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, STAT_TYPE, query )
	);

	const rows = flattenVideoPlaysRows( data );
	// The list's QuerySiteStats dispatches this exact fetch from a mount effect,
	// so `isRequesting` flips true before the first paint — the brief window
	// where it's still false with no rows (which would hide the card) isn't
	// observable. Once requesting, no rows means loading; otherwise no rows
	// means the site genuinely has none.
	const isLoading = isRequesting && rows.length === 0;

	// Hide entirely behind the paywall, and on sites with no video data, so an
	// empty Performance card never sits above an empty list.
	if ( isGated || ( ! isLoading && rows.length === 0 ) ) {
		return null;
	}

	return (
		<VideosPerformanceCards totals={ aggregateVideoPerformance( rows ) } isLoading={ isLoading } />
	);
}

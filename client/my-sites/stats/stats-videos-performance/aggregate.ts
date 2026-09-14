export interface VideoPlaysRow {
	post_id: number;
	title: string;
	views: number;
	impressions: number;
	watch_time: number;
	retention_rate: number;
}

export interface PerformanceTotals {
	views: number;
	impressions: number;
	watch_time: number;
	retention_rate: number | null;
}

interface VideoPlaysDayBucket {
	data?: VideoPlaysRow[];
}

interface VideoPlaysResponse {
	days?: Record< string, VideoPlaysDayBucket >;
}

/**
 * The `stats/video-plays` complete_stats response nests per-video rows under
 * `days[<bucket>].data`, where `<bucket>` is the period start (or `summary` for
 * a summarized range). Flatten every bucket's rows, tolerating a missing or
 * malformed payload.
 */
export function flattenVideoPlaysRows( data: unknown ): VideoPlaysRow[] {
	const days = ( data as VideoPlaysResponse | null )?.days;
	if ( ! days ) {
		return [];
	}
	return Object.values( days ).flatMap( ( bucket ) =>
		Array.isArray( bucket?.data ) ? bucket.data : []
	);
}

/**
 * Sum the per-video rows into the card's four totals. Views, impressions and
 * watch time are additive. Retention rate is not, so it is reported as a
 * views-weighted average; with no views there is nothing to weight and it is
 * `null` (rendered as a dash).
 */
export function aggregateVideoPerformance( rows: VideoPlaysRow[] ): PerformanceTotals {
	let views = 0;
	let impressions = 0;
	let watchTime = 0;
	let retentionWeighted = 0;

	for ( const row of rows ) {
		views += row.views || 0;
		impressions += row.impressions || 0;
		watchTime += row.watch_time || 0;
		retentionWeighted += ( row.retention_rate || 0 ) * ( row.views || 0 );
	}

	return {
		views,
		impressions,
		watch_time: watchTime,
		retention_rate: views > 0 ? retentionWeighted / views : null,
	};
}

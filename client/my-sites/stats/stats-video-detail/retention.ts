export interface RetentionBucket {
	plays: number;
	retentionRate: number;
}

/**
 * Aggregate per-bucket retention rates into a single rate for the window.
 *
 * Retention can't be summed across buckets: the canonical formula is
 * rate = (watch_time / plays) / duration. Since every bucket satisfies
 * rate_i = (watch_i / plays_i) / duration, weighting each bucket's rate by its
 * plays gives Σ(rate_i · plays_i) / Σplays_i = (Σwatch / Σplays) / duration —
 * the endpoint's own `total` computation. Unlike back-deriving the duration
 * from a single reference bucket, the rounding error the API bakes into a
 * low-traffic bucket's rate only contributes in proportion to that bucket's
 * plays instead of polluting the whole window.
 */
export function calculatePlayWeightedRetention( buckets: RetentionBucket[] ): number {
	let plays = 0;
	let weightedRate = 0;
	for ( const bucket of buckets ) {
		plays += bucket.plays;
		weightedRate += bucket.retentionRate * bucket.plays;
	}
	return plays > 0 ? weightedRate / plays : 0;
}

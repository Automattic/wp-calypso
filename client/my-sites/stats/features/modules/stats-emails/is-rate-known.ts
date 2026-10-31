interface RateSignals {
	/** Unique (deduplicated per-recipient) count behind the rate. */
	uniques: number;
	/** Total event count for the same metric. */
	totals: number;
	/** Total sends, the rate's denominator. */
	sends: number;
}

interface ClickRateSignals {
	uniqueClicks: unknown;
	totalClicks: unknown;
	sends: unknown;
}

/**
 * Calculate a click rate from the underlying counts.
 *
 * Unique clicks are preferred when available. Older data without unique
 * attribution falls back to total clicks so it can still produce a useful
 * rate.
 */
export function calculateClickRate( {
	uniqueClicks,
	totalClicks,
	sends,
}: ClickRateSignals ): number | null {
	const sendCount = toCount( sends );

	if ( sendCount <= 0 ) {
		return null;
	}

	const uniqueClickCount = toCount( uniqueClicks );
	const clickCount = uniqueClickCount > 0 ? uniqueClickCount : toCount( totalClicks );

	return ( clickCount / sendCount ) * 100;
}

/**
 * Whether a unique-based email rate is a known value.
 *
 * The rate needs a denominator: no recorded sends means 0/0, which is
 * undefined, not 0%. With sends recorded, uniques above zero mean the rate is
 * real, and totals of zero mean the uniques are genuinely zero, a true 0%.
 * Totals with no attributable uniques mean the unique count, and therefore the
 * rate, is unknown.
 */
export function isRateKnown( { uniques, totals, sends }: RateSignals ): boolean {
	return sends > 0 && ( uniques > 0 || totals === 0 );
}

/**
 * Parse a count that may arrive as a number, numeric string, null or undefined.
 */
export function toCount( value: unknown ): number {
	return parseInt( String( value ), 10 ) || 0;
}

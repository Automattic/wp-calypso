import { formatSiteYmd } from './datetime';

/**
 * Creates a full-day time range for activity log filtering, spanning from the start of the
 * first date to the end of the last date. Expects site calendar days, as produced by the
 * date range picker.
 */
export function buildTimeRangeForActivityLog(
	start: Date,
	end: Date
): { after: string; before: string } {
	return {
		after: `${ formatSiteYmd( start ) } 00:00:00`,
		before: `${ formatSiteYmd( end ) } 23:59:59`,
	};
}

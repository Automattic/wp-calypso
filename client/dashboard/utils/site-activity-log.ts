import { formatSiteYmd } from './datetime';

/**
 * Serialize site calendar days, held as browser-local Dates, to the site-clock strings
 * expected by the Backups API. Do not reinterpret these day carriers as instants.
 */
export function buildTimeRangeForActivityLog(
	start: Date,
	end: Date
): { after: string; before: string } {
	const startYmd = formatSiteYmd( start );
	const endYmd = formatSiteYmd( end );

	const after = `${ startYmd } 00:00:00`;
	const before = `${ endYmd } 23:59:59`;

	return { after, before };
}

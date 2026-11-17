import { isMobile } from '@automattic/viewport';

export type ChartType = 'bar' | 'line';

// Per site, in the viewer's browser. Premium Analytics reads the same key for its traffic
// chart's default, and the wp-admin dashboard widget follows it too.
const storageKey = ( siteId: number ) => `jetpack_stats_chart_type_${ siteId }`;

/**
 * How the viewer draws this site's traffic chart: the choice saved from the Stats page, or
 * the page's own default when there is none, bars, and lines on a phone.
 * @param siteId         The current site id.
 * @param isMobileScreen Whether the viewport is below the mobile breakpoint.
 * @returns Bars or lines.
 */
export function readChartType(
	siteId: number | null | undefined,
	isMobileScreen = isMobile()
): ChartType {
	if ( ! siteId ) {
		return 'bar';
	}

	try {
		const stored = localStorage.getItem( storageKey( siteId ) );
		if ( 'bar' === stored || 'line' === stored ) {
			return stored;
		}
	} catch {
		// `localStorage` throws outright where site data is blocked; fall through to the default.
	}

	return isMobileScreen ? 'line' : 'bar';
}

/**
 * Saves the viewer's choice for this site.
 * @param siteId    The current site id.
 * @param chartType Bars or lines.
 */
export function saveChartType( siteId: number, chartType: ChartType ) {
	try {
		localStorage.setItem( storageKey( siteId ), chartType );
	} catch {
		// Nothing to save into; the page keeps the choice in state until it is reloaded.
	}
}

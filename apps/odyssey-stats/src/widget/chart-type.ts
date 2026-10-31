export type ChartType = 'bar' | 'line';

// The key the Stats page writes when the viewer switches its chart between bars and lines
// (`stats-chart-tabs`), and Premium Analytics reads for its traffic chart's default.
const storageKey = ( siteId: number ) => `jetpack_stats_chart_type_${ siteId }`;

/**
 * How the viewer draws this site's traffic on the Stats page, or bars, the page's own
 * default. The widget has no switch of its own; the page's choice carries over, since the
 * two share the viewer's browser storage in wp-admin.
 * @param siteId The current site id.
 */
export default function readStatsChartType( siteId: number ): ChartType {
	try {
		const stored = localStorage.getItem( storageKey( siteId ) );
		return 'line' === stored || 'bar' === stored ? stored : 'bar';
	} catch {
		// `localStorage` throws outright where site data is blocked; fall back quietly.
		return 'bar';
	}
}

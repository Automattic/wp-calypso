import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Records a Tracks event for the dashboard widget, following the `jetpack_odyssey_stats_`
 * naming the rest of Odyssey Stats uses.
 * @param name       The action, verb last, e.g. `date_range_changed`.
 * @param properties Event properties.
 */
export default function recordWidgetEvent( name: string, properties?: Record< string, string > ) {
	recordTracksEvent( `jetpack_odyssey_stats_widget_${ name }`, properties );
}

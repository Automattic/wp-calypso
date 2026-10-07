import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { MouseEvent } from 'react';

// Tracks only queues an event, and navigating in the same tick cancels its request. The
// connection flow waits the same beat.
const TRACKS_FLUSH_DELAY = 250;

/**
 * Records a `jetpack_odyssey_stats_widget_*` Tracks event.
 * @param name       The action, verb last, e.g. `date_range_changed`.
 * @param properties Event properties.
 */
export default function recordWidgetEvent( name: string, properties?: Record< string, string > ) {
	recordTracksEvent( `jetpack_odyssey_stats_widget_${ name }`, properties );
}

/**
 * Click handler for a link that leaves the dashboard: records the event, then follows the
 * link a beat later. A click that opens a new tab or window is left alone.
 * @param name       The action, verb last.
 * @param properties Event properties.
 * @returns The click handler.
 */
export function recordWidgetEventThenFollow( name: string, properties?: Record< string, string > ) {
	return ( event: MouseEvent< HTMLAnchorElement > ) => {
		recordWidgetEvent( name, properties );

		const opensElsewhere =
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			event.currentTarget.target === '_blank';
		if ( opensElsewhere ) {
			return;
		}

		const { href } = event.currentTarget;
		event.preventDefault();
		setTimeout( () => {
			window.location.href = href;
		}, TRACKS_FLUSH_DELAY );
	};
}

import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { MouseEvent } from 'react';

/**
 * Tracks only queues an event; navigating in the same tick cancels the request that would
 * have sent it. The connection flow waits the same beat before leaving the page.
 */
const TRACKS_FLUSH_DELAY = 250;

/**
 * Records a Tracks event for the dashboard widget, following the `jetpack_odyssey_stats_`
 * naming the rest of Odyssey Stats uses.
 * @param name       The action, verb last, e.g. `date_range_changed`.
 * @param properties Event properties.
 */
export default function recordWidgetEvent( name: string, properties?: Record< string, string > ) {
	recordTracksEvent( `jetpack_odyssey_stats_widget_${ name }`, properties );
}

/**
 * Click handler for a link that leaves the dashboard: records the event, then follows the
 * link a beat later so the request survives. A click the browser would open elsewhere —
 * a new tab or window — is left alone, since the page it was clicked from stays put.
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

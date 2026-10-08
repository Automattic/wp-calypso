import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { DateRangeId } from '../lib/date-ranges';
import type { ExploreMoreDestination } from '../lib/get-explore-more-url';
import type { MouseEvent } from 'react';

// Tracks only queues an event, and navigating in the same tick cancels its request. The
// connection flow waits the same beat.
const TRACKS_FLUSH_DELAY = 250;

type HighlightsTab = 'top_posts' | 'top_referrers';

interface WidgetEvents {
	date_range_changed: { range: DateRangeId };
	highlights_tab_clicked: { tab: HighlightsTab };
	see_more_clicked: { tab: HighlightsTab; range: DateRangeId };
	post_clicked: undefined;
	referrer_clicked: undefined;
	anti_spam_insights_clicked: undefined;
	more_stats_clicked: { range: DateRangeId };
	explore_more_clicked: { destination: ExploreMoreDestination };
}

type WidgetEventName = keyof WidgetEvents;

type WidgetEventArgs< Name extends WidgetEventName > = WidgetEvents[ Name ] extends undefined
	? []
	: [ properties: WidgetEvents[ Name ] ];

let isFollowingLink = false;

/**
 * Records a `jetpack_odyssey_stats_widget_*` Tracks event.
 * @param name The action, verb last, e.g. `date_range_changed`.
 * @param args The event's properties, for the events that have them.
 */
export default function recordWidgetEvent< Name extends WidgetEventName >(
	name: Name,
	...args: WidgetEventArgs< Name >
) {
	recordTracksEvent( `jetpack_odyssey_stats_widget_${ name }`, args[ 0 ] );
}

/**
 * Click handler for a link that leaves the dashboard: records the event, then follows the
 * link a beat later. A click that opens a new tab or window is left alone.
 * @param name The action, verb last.
 * @param args The event's properties, for the events that have them.
 * @returns The click handler.
 */
export function recordWidgetEventThenFollow< Name extends WidgetEventName >(
	name: Name,
	...args: WidgetEventArgs< Name >
) {
	return ( event: MouseEvent< HTMLAnchorElement > ) => {
		const opensElsewhere =
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			event.currentTarget.target === '_blank';
		if ( opensElsewhere ) {
			recordWidgetEvent( name, ...args );
			return;
		}

		event.preventDefault();
		// Nothing on screen changes while the page waits, so a second click is likely; it
		// would otherwise count twice.
		if ( isFollowingLink ) {
			return;
		}
		isFollowingLink = true;
		recordWidgetEvent( name, ...args );

		const { href } = event.currentTarget;
		setTimeout( () => {
			window.location.href = href;
			// A link that only changes the hash leaves the page in place.
			isFollowingLink = false;
		}, TRACKS_FLUSH_DELAY );
	};
}

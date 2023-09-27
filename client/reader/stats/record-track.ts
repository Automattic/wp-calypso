import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { buildReaderTracksEventProps } from './build-reader-tracks-event-props';
import debug from './debug';
import { type ReaderEventProperties } from './types';

/**
 * @param {string} eventName track event name
 * @param {ReaderEventProperties} eventProperties extra event props
 * @param {{pathnameOverride: string}} [pathnameOverride] Overwrites the location for ui_algo Useful for when
 *   recordTrack() is called after loading the next window.
 *   For example: opening an article (calypso_reader_article_opened) would call
 *   recordTrack after changing windows and would result in a `ui_algo: single_post`
 *   regardless of the stream the post was opened. This now allows the article_opened
 *   Tracks event to correctly specify which stream the post was opened.
 * @deprecated Use the recordReaderTracksEvent action instead.
 */
export function recordTrack(
	eventName: string,
	eventProperties: ReaderEventProperties,
	{ pathnameOverride }: { pathnameOverride?: string } = {}
): void {
	debug( 'reader track', eventName, eventProperties, { pathnameOverride } );

	eventProperties = buildReaderTracksEventProps( eventProperties, pathnameOverride );

	if ( process.env.NODE_ENV !== 'production' ) {
		if (
			'blog_id' in eventProperties &&
			'post_id' in eventProperties &&
			! ( 'is_jetpack' in eventProperties )
		) {
			// eslint-disable-next-line no-console
			console.warn( 'consider using recordTrackForPost...', eventName, eventProperties );
		}
	}

	recordTracksEvent( eventName, eventProperties );
}

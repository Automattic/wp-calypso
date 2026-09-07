import { recordTracksEvent } from './stats';

const MILESTONE_SIZE = 50;

/**
 * Build a reporter that records how long the note list takes to render as it grows.
 *
 * The list is not virtualized, so every loaded note is a live DOM row and render
 * cost climbs with the count. Reporting on milestone crossings keeps a full scroll
 * to the cap at ~10 events while bucketing the counts for the query.
 * @param {string} surface Which list is reporting: 'panel' or 'app'.
 * @returns {Function} Called after each commit with the render's start time.
 */
export function createListRenderTracker( surface ) {
	// -1 so the first render reports a baseline below the first milestone.
	let highestMilestone = -1;
	let trackedFilter = null;

	return ( { filterName, noteCount, startedAt } ) => {
		// An empty list has nothing to measure, and reporting it would spend the
		// first-render slot that the smallest real count needs.
		if ( noteCount === 0 ) {
			return;
		}

		if ( filterName !== trackedFilter ) {
			trackedFilter = filterName;
			highestMilestone = -1;
		}

		const milestone = Math.floor( noteCount / MILESTONE_SIZE ) * MILESTONE_SIZE;
		if ( milestone <= highestMilestone ) {
			return;
		}
		highestMilestone = milestone;

		recordTracksEvent( 'calypso_notification_list_render', {
			surface,
			filter: filterName,
			note_count: noteCount,
			render_time_in_ms: Math.round( performance.now() - startedAt ),
		} );
	};
}

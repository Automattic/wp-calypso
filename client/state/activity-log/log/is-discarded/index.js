/** @format */
/**
 * External dependencies
 */

import { memoize } from 'lodash';

/**
 * Normalize timestamp values
 *
 * Some timestamps are in seconds instead
 * of in milliseconds and this will make
 * sure they are all reported in ms
 *
 * The chosen comparison date is older than
 * WordPress so no backups should already
 * exist prior to that date 😉
 *
 * @param {Number} ts timestamp in 's' or 'ms'
 * @returns {Number} timestamp in 'ms'
 */
export const ms = ts =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

/**
 * Extracts pairs of restore/backup timestamps
 * from stream of Activity Log events
 *
 * @param {Array<Object>} events stream of Activity Log events
 * @returns {Array<Array<Number>>} pairs of [ restore event timestamp, associated backup event timestamp ]
 */
export const getRewinds = events =>
	events
		.filter( ( { activityName } ) => activityName === 'rewind__complete' )
		.map( ( { activityTs, activityTargetTs } ) => [ activityTs, ms( activityTargetTs ) ] );

/**
 * Creates a function which can be used to compute whether
 * or not an event should be considered discarded
 *
 * @see ./README.md
 *
 * @param {Array<Array<Number>>} rewinds list of pairs of rewind event timestamps and associated backup event timestamps
 * @param {Number} viewFrom timestamp from perspective from which we are analyzing discardability of events
 * @returns {Function} function which calculates `isDiscarded` property for a given event's timestamp
 */
export const makeIsDiscarded = ( rewinds, viewFrom ) => {
	/**
	 * Memoized function used to calculate `isDiscarded` property
	 *
	 * @param {Number} ts timestamp for event under examination
	 * @returns {Boolean} whether or not event would be considered discarded from perspective of `viewFrom`
	 */
	const isDiscarded = memoize(
		ts =>
			ts > viewFrom ||
			rewinds.some(
				/**
				 * Finds covering restore events and recurses to eliminate discarded restores
				 *
				 * @param {Number} rp timestamp of "Restore Point" event
				 * @param {Number} bp timestamp of "Backup Point" event
				 * @returns {boolean} whether or not event should be considered discarded
				 */
				( [ rp, bp ] ) => ! ( bp >= ts || ts >= rp || rp > viewFrom || isDiscarded( rp ) )
			)
	);

	return isDiscarded;
};

export const rewriteStream = ( events, rewinds, viewFrom = Date.now() ) => {
	const isDiscarded = makeIsDiscarded( rewinds.filter( ( [ rp ] ) => rp <= viewFrom ), viewFrom );

	return events.map( event => ( {
		...event,
		activityIsDiscarded: isDiscarded( event.activityTs ),
	} ) );
};

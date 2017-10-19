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
const ms = ts =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

export const getRewinds = events =>
	events
		.filter( ( { activityName } ) => activityName === 'rewind__complete' )
		.map( ( { activityTs, activityTargetTs } ) => [ activityTs, ms( activityTargetTs ) ] );

export const isDiscardeder = ( rewinds, viewFrom ) => {
	const isDiscarded = memoize(
		ts =>
			ts > viewFrom ||
			rewinds.some(
				( [ rp, bp ] ) => ! ( bp >= ts || ts >= rp || rp > viewFrom || isDiscarded( rp ) )
			)
	);

	return isDiscarded;
};

export const rewriteStream = ( events, viewFrom = Date.now() ) => {
	const rewinds = getRewinds( events );
	const isDiscarded = isDiscardeder( rewinds, viewFrom );

	return events.map( event => ( {
		...event,
		activityIsDiscarded: isDiscarded( event.activityTs ),
	} ) );
};

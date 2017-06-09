/**
 * External dependencies
 */
import moment from 'moment';

// This generates a fake data set for hourly backups
// FIXME: this will not be needed when we have an actual log of events
const fakebackups = ( startDate ) => {
	const today = moment( new Date().getTime() ),
		beginning = moment( new Date( startDate ).getTime() ),
		numHours = today.diff( beginning, 'hours' ),
		backupLogs = [];

	let i,
		timeIncrement = today.toDate().getTime();

	for ( i = 0; i < numHours; i++ ) {
		backupLogs.push(
			{
				title: 'Site backed up',
				description: 'We backed up your site',
				user: null,
				type: 'site_backed_up',
				timestamp: timeIncrement
			}
		);
		timeIncrement = moment( timeIncrement ).subtract( 1, 'h' ).toDate().getTime();
	}

	return backupLogs;
};

/**
 * Returns list of Activity Log items.
 *
 * FIXME: Pull real data from the state.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @param {string} startDate Date string of the first available backup FIXME: probably not needed with real data
 * @return {array} Array of activity log item objects
 */
export default function getActivityLog( state, siteId, startDate ) {
	return fakebackups( startDate );
}

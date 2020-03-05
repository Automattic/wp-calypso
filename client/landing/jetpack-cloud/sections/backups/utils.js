/**
 * External dependencies
 */
import moment from 'moment';

/**
 * if the activityDateString is on the same date as we are looking at
 *
 * @param {string} activityDateString date string from activity log in ISO 8601 format
 * @param {string} targetDateString date that we want log items for in ISO 8601 format
 * @returns {boolean} if the given activityDateString
 */
export const isActivityItemDateEqual = ( activityDateString, targetDateString ) =>
	moment.parseZone( targetDateString ).isSame( moment.parseZone( activityDateString ), 'day' );

/**
 * filters the given activity logs into complete and error items from the given date
 *
 * @param {Array} logs an array of logs from the ActivityLog
 * @param {string} targetDateString date that we want log items for in ISO 8601 format
 * @returns {object} backup items for the day, sorted into complete backups for the day and errors
 */
export const getBackupAttemptsForDate = ( logs, targetDateString ) => ( {
	complete: logs.filter(
		item =>
			'rewind__backup_complete_full' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDateString )
	),
	error: logs.filter(
		item =>
			'rewind__backup_error' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDateString )
	),
} );

/**
 * External dependencies
 */
import moment from 'moment';

/**
 * if the activityDateString is on the same date as we are looking at
 *
 * @param {string} activityDateString date string from activity log in ISO 8601 format
 * @param {Date} targetDate date that we want log items for
 * @returns {boolean} if the given activityDateString
 */
export const isActivityItemDateEqual = ( activityDateString, targetDate ) =>
	moment( targetDate ).isSame( activityDateString, 'day' );

/**
 * filters the given activity logs into complete and error items from the given date
 *
 * @param {Array} logs an array of logs from the ActivityLog
 * @param {Date} targetDate date that we want log items for
 * @returns {object} backup items for the day, sorted into complete backups for the day and errors
 */
export const getBackupAttemptsForDate = ( logs, targetDate ) => ( {
	complete: logs.filter(
		item =>
			'rewind__backup_complete_full' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDate )
	),
	error: logs.filter(
		item =>
			'rewind__backup_error' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDate )
	),
} );

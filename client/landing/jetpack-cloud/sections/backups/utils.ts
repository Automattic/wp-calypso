/**
 * External dependencies
 */
import moment from 'moment';

export const isActivityItemDateEqual = ( activityDateString: string, targetDate: Date ) =>
	moment( targetDate ).isSame( activityDateString, 'day' );

export const getBackupAttemptsForDate = ( logs, date: Date ) => ( {
	complete: logs.filter(
		item =>
			'rewind__backup_complete_full' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, date )
	),
	error: logs.filter(
		item =>
			'rewind__backup_error' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, date )
	),
} );

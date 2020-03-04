export const getBackupAttemptsForDate = ( logs, date ) => ( {
	complete: logs.filter(
		item =>
			'rewind__backup_complete_full' === item.activityName &&
			item.activityDate.split( 'T' )[ 0 ] === date
	),
	error: logs.filter(
		item =>
			'rewind__backup_error' === item.activityName && item.activityDate.split( 'T' )[ 0 ] === date
	),
} );

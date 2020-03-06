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

export const getChangesInRange = ( logs, t1, t2 ) => {
	return logs.filter( event => {
		const eventTime = new Date( event.activityDate ).getTime();
		return eventTime > t1 && eventTime < t2;
	} );
};

export const getEventsInDailyBackup = ( logs, date ) => {
	const d = new Date( date );
	d.setDate( d.getDate() - 1 );
	const d1 = d.toISOString().split( 'T' )[ 0 ];
	const d2 = new Date( date ).toISOString().split( 'T' )[ 0 ];
	const lastBackup = getBackupAttemptsForDate( logs, d1 );
	const thisBackup = getBackupAttemptsForDate( logs, d2 );

	if ( ! ( lastBackup.complete.length && thisBackup.complete.length ) ) {
		return [];
	}

	const lastBackupDate = new Date( lastBackup.complete[ 0 ].activityDate );
	const thisBackupDate = new Date( thisBackup.complete[ 0 ].activityDate );
	const lastBackupTime = lastBackupDate.getTime();
	const thisBackupTime = thisBackupDate.getTime();

	return getChangesInRange( logs, lastBackupTime, thisBackupTime );
};

export const getDailyBackupDeltas = ( logs, date ) => {
	const changes = getEventsInDailyBackup( logs, date );

	const mediaCreated = changes.filter( event => 'attachment__uploaded' === event.activityName );
	const mediaDeleted = changes.filter( event => 'attachment__deleted' === event.activityName );
	const posts = changes.filter(
		event => 'post__published' === event.activityName || 'post__trashed' === event.activityName
	);

	return {
		mediaCreated,
		posts,
		mediaDeleted,
	};
};

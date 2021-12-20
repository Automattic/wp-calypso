export const INDEX_FORMAT = 'YYYYMMDD';

export const DELTA_ACTIVITIES = [
	'attachment__uploaded',
	// 'attachment__updated',
	'attachment__deleted',
	'post__published',
	'post__trashed',
	// 'post__updated',
	'plugin__installed',
	'plugin__deleted',
	'theme__installed',
	'theme__deleted',
	'user__invite_accepted',
];

export const getDeltaActivities = ( logs ) => {
	return logs.filter( ( { activityName } ) => DELTA_ACTIVITIES.includes( activityName ) );
};

export const getDeltaActivitiesByType = ( logs ) => {
	return {
		mediaCreated: logs.filter( ( event ) => 'attachment__uploaded' === event.activityName ),
		mediaDeleted: logs.filter( ( event ) => 'attachment__deleted' === event.activityName ),
		posts: logs.filter(
			( event ) =>
				'post__published' === event.activityName || 'post__trashed' === event.activityName
		),
		postsCreated: logs.filter( ( event ) => 'post__published' === event.activityName ),
		postsDeleted: logs.filter( ( event ) => 'post__trashed' === event.activityName ),
		plugins: logs.filter(
			( event ) =>
				'plugin__installed' === event.activityName || 'plugin__deleted' === event.activityName
		),
		themes: logs.filter(
			( event ) =>
				'theme__installed' === event.activityName || 'theme__deleted' === event.activityName
		),
		users: logs.filter( ( event ) => 'user__invite_accepted' === event.activityName ),
	};
};

/**
 * Check if the activity is the type of backup
 *
 * @param activity {object} Activity to check
 */
export const isActivityBackup = ( activity ) => {
	return (
		'rewind__backup_complete_full' === activity.activityName ||
		'rewind__backup_complete_initial' === activity.activityName ||
		'rewind__backup_error' === activity.activityName ||
		'rewind__backup_only_complete_full' === activity.activityName ||
		'rewind__backup_only_complete_initial' === activity.activityName
	);
};

/**
 * Check if the backup is completed
 *
 * @param backup {object} Backup to check
 */
export const isSuccessfulDailyBackup = ( backup ) => {
	return (
		'rewind__backup_complete_full' === backup.activityName ||
		'rewind__backup_complete_initial' === backup.activityName ||
		'rewind__backup_only_complete_full' === backup.activityName ||
		'rewind__backup_only_complete_initial' === backup.activityName
	);
};

/**
 * Check if a Realtime backup backup is completed
 *
 * @param backup {object} Backup to check
 */
export const isSuccessfulRealtimeBackup = ( backup ) => {
	const hasRestorableStreams =
		backup.streams && !! backup.streams.filter( ( stream ) => stream.activityIsRewindable ).length;
	return hasRestorableStreams || backup.activityIsRewindable;
};

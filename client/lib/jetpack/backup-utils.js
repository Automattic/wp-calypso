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

export const SUCCESSFUL_BACKUP_ACTIVITIES = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_only_complete_full',
	'rewind__backup_only_complete_initial',
];

export const BACKUP_ATTEMPT_ACTIVITIES = [
	...SUCCESSFUL_BACKUP_ACTIVITIES,
	'rewind__backup_error',
	'rewind__backup_only_error',
];

/**
 * Check if the activity is the type of backup
 *
 * @param activity {object} Activity to check
 */
export const isActivityBackup = ( activity ) => {
	return BACKUP_ATTEMPT_ACTIVITIES.includes( activity.activityName );
};

/**
 * Retrieve the backup error code from activity object.
 *
 * @typedef {import('calypso/state/data-layer/wpcom/sites/activity/from-api.js').processItem} ProcessItem
 * @param {Object} activity Activity to get the error code from.
 * @returns {'BAD_CREDENTIALS'|'NOT_ACCESSIBLE'} The error code as set in @see {ProcessItem}
 */
export const getBackupErrorCode = ( activity ) => {
	return activity?.activityMeta?.errorCode?.toUpperCase?.();
};

/**
 * Retrieve any warnings from a backup activity object.
 *
 * @param backup {object} Backup to check
 */
export const getBackupWarnings = ( backup ) => {
	if ( ! backup || ! backup.activityWarnings ) {
		return {};
	}
	const warnings = {};

	Object.keys( backup.activityWarnings ).forEach( function ( itemType ) {
		const typeWarnings = backup.activityWarnings[ itemType ];
		typeWarnings.forEach( ( typeWarning ) => {
			if ( ! warnings.hasOwnProperty( typeWarning.name ) ) {
				warnings[ typeWarning.name ] = {
					category: typeWarning.category,
					items: [],
				};
			}

			const warningItem = {
				code: typeWarning.code,
				item: typeWarning.itemName,
			};

			warnings[ typeWarning.name ].items.push( warningItem );
		} );
	} );

	return warnings;
};

/**
 * Check if the backup is completed
 *
 * @param backup {object} Backup to check
 */
export const isSuccessfulDailyBackup = ( backup ) => {
	return SUCCESSFUL_BACKUP_ACTIVITIES.includes( backup.activityName );
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

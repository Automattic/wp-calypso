/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty, get } from 'lodash';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_BACKUP_PROGRESS_REQUEST, REWIND_BACKUP_DISMISS_PROGRESS } from 'state/action-types';
import { updateRewindBackupProgress, rewindBackupUpdateError } from 'state/activity-log/actions';

/** @type {number} how many ms between polls for same data */
const POLL_INTERVAL = 1500;

/** @type {Map<string, number>} stores most-recent polling times */
const recentRequests = new Map();

/**
 * Fetch status updates for backup file downloads
 *
 * Note! Eventually the manual "caching" here should be
 * replaced by the `freshness` system in the data layer
 * when it arrives. For now, it's statefully ugly.
 *
 * @param {object} action Redux action
 */
const fetchProgress = ( action ) => {
	const { downloadId, siteId } = action;
	const key = `${ siteId }-${ downloadId }`;

	const lastUpdate = recentRequests.get( key ) || -Infinity;
	const now = Date.now();

	if ( now - lastUpdate < POLL_INTERVAL ) {
		return;
	}

	recentRequests.set( key, now );

	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/downloads`,
		},
		action
	);
};

/**
 * Parse and merge response data for backup creation status with defaults.
 *
 * @param   {object} data The data received from API response.
 * @returns {object}      Parsed response data.
 */
const fromApi = ( data ) => ( {
	backupPoint: data.backupPoint,
	downloadId: +data.downloadId,
	progress: +data.progress,
	rewindId: data.rewindId,
	startedAt: data.startedAt,
	downloadCount: +data.downloadCount,
	validUntil: data.validUntil,
	url: data.url,
	error: data.error,
} );

/**
 * When requesting the status of a backup creation, an array with a single element is returned.
 * This single element contains the information about the latest backup creation progress.
 * If an error property was found, it will display an error card stating it.
 * Otherwise the backup creation progress will be updated.
 *
 * @param {number}   siteId   Id of the site for the one we're creating a backup.
 * @param {object}   apiData  Data returned by a successful response.
 */
export const updateProgress = ( { siteId }, apiData ) => {
	const [ latestDownloadableBackup ] = apiData;
	if ( isEmpty( latestDownloadableBackup ) ) {
		return;
	}

	const data = fromApi( latestDownloadableBackup );
	return get( data, [ 'error' ], false )
		? rewindBackupUpdateError( siteId, data.downloadId, data )
		: updateRewindBackupProgress( siteId, data.downloadId, data );
};

/**
 * If the backup creation progress request fails, an error notice will be shown.
 *
 * @returns {Function}          The dispatched action.
 */
export const announceError = () =>
	errorNotice(
		translate( "Hmm, we can't update the status of your backup. Please refresh this page." )
	);

/**
 * Mark a specific downloadable backup record as dismissed.
 * This has the effect that subsequent calls to /sites/%site_id%/rewind/downloads won't return the download.
 *
 * @param   {object}   action   Changeset to update state.
 * @returns {object}          The dispatched action.
 */
export const dismissBackup = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/downloads/${ action.downloadId }`,
			body: {
				dismissed: true,
			},
		},
		action
	);

/**
 * On successful dismiss, the card will be removed and we don't need to do anything further.
 * If request succeeded but backup couldn't be dismissed, a notice will be shown.
 *
 * @param {object}   action   Changeset to update state.
 * @param {object}     data     Description of request result.
 */
export const backupSilentlyDismissed = ( action, data ) =>
	! data.dismissed
		? errorNotice( translate( 'Dismissing backup failed. Please reload and try again.' ) )
		: null;

/**
 * If a dismiss request fails, an error notice will be shown.
 *
 * @returns {Function} The dispatched action.
 */
export const backupDismissFailed = () =>
	errorNotice( translate( 'Dismissing backup failed. Please reload and try again.' ) );

/**
 * Parse and merge response data for backup dismiss result with defaults.
 *
 * @param   {object} data   The data received from API response.
 * @returns {object} Parsed response data.
 */
const fromBackupDismiss = ( data ) => ( {
	downloadId: +data.download_id,
	dismissed: data.is_dismissed,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/downloads', {
	[ REWIND_BACKUP_PROGRESS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchProgress,
			onSuccess: updateProgress,
			onError: announceError,
		} ),
	],
	[ REWIND_BACKUP_DISMISS_PROGRESS ]: [
		dispatchRequest( {
			fetch: dismissBackup,
			onSuccess: backupSilentlyDismissed,
			onError: backupDismissFailed,
			fromApi: fromBackupDismiss,
		} ),
	],
} );

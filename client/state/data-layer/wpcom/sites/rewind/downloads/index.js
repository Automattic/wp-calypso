/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { REWIND_BACKUP_PROGRESS_REQUEST } from 'state/action-types';
import { updateRewindBackupProgress } from 'state/activity-log/actions';

/** @type {Number} how many ms between polls for same data */
const POLL_INTERVAL = 1500;

/** @type {Map<String, Number>} stores most-recent polling times */
const recentRequests = new Map();

/**
 * Fetch status updates for backup file downloads
 *
 * Note! Eventually the manual "caching" here should be
 * replaced by the `freshness` system in the data layer
 * when it arrives. For now, it's statefully ugly.
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
const fetchProgress = ( { dispatch }, action ) => {
	const { downloadId, siteId } = action;
	const key = `${ siteId }-${ downloadId }`;

	const lastUpdate = recentRequests.get( key ) || -Infinity;
	const now = Date.now();

	if ( now - lastUpdate < POLL_INTERVAL ) {
		return;
	}

	recentRequests.set( key, now );

	dispatch(
		http(
			{
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ action.siteId }/rewind/downloads/${ action.downloadId }`,
				body: {
					downloadId: action.downloadId,
				},
			},
			action
		)
	);
};

const fromApi = data => ( {
	backupPoint: data.backupPoint,
	downloadId: +data.downloadId,
	progress: +data.progress,
	rewindId: data.rewindId,
	startedAt: data.startedAt,
	downloadCount: +data.downloadCount,
	validUntil: data.validUntil,
	url: data.url,
} );

export const updateProgress = ( { dispatch }, { siteId, downloadId }, data ) =>
	dispatch( updateRewindBackupProgress( siteId, downloadId, data ) );

export const announceError = ( { dispatch } ) =>
	dispatch(
		errorNotice(
			translate( "Hmm, we can't update the status of your backup. Please refresh this page." )
		)
	);

export default {
	[ REWIND_BACKUP_PROGRESS_REQUEST ]: [
		dispatchRequest( fetchProgress, updateProgress, announceError, {
			fromApi,
		} ),
	],
};

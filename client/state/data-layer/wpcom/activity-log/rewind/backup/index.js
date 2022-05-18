import i18n from 'i18n-calypso';
import { REWIND_BACKUP_SITE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const enqueueSiteBackup = ( action ) =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/rewind/backups/enqueue`,
			body: {},
		},
		action
	);

const fromApi = ( data ) => {
	return data;
};

export const announceSuccess = ( { noticeId } ) =>
	successNotice( i18n.translate( 'Backup successfully queued.' ), {
		duration: 4000,
		id: noticeId,
	} );

export const announceFailure = ( { noticeId } ) =>
	errorNotice( i18n.translate( 'Error queueing a new backup.' ), {
		duration: 4000,
		id: noticeId,
	} );

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/backup/index.js', {
	[ REWIND_BACKUP_SITE ]: [
		dispatchRequest( {
			fetch: enqueueSiteBackup,
			onSuccess: announceSuccess,
			onError: announceFailure,
			fromApi,
		} ),
	],
} );

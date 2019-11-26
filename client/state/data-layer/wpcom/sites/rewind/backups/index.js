/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { REWIND_BACKUPS_REQUEST } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import {
	failRewindBackupsRequest,
	receiveRewindBackups,
	successRewindBackupsRequest,
} from 'state/rewind/backups/actions';

const fetchRewindBackups = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/backups`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const setRewindBackups = ( { siteId }, backups ) => [
	successRewindBackupsRequest( siteId ),
	receiveRewindBackups( siteId, backups ),
];

const displayError = ( { siteId } ) => [
	failRewindBackupsRequest( siteId ),
	receiveRewindBackups( siteId, [] ),
	errorNotice(
		translate(
			'Sorry, we had a problem retrieving the site backups. Please refresh the page and try again.'
		),
		{
			duration: 5000,
		}
	),
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/backups/index.js', {
	[ REWIND_BACKUPS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchRewindBackups,
			onSuccess: setRewindBackups,
			onError: displayError,
		} ),
	],
} );

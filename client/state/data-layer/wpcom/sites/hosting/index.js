/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOSTING_RESTORE_DATABASE_PASSWORD } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

const requestRestoreDatabasePassword = action =>
	http(
		{
			path: `/sites/${ action.siteId }/hosting/restore-database-password`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const receiveRestoreDatabasePasswordSuccess = () => {
	return successNotice( translate( 'Your database password has been restored.' ), {
		duration: 5000,
	} );
};

const receiveRestoreDatabasePasswordError = () => {
	return errorNotice(
		translate( 'Sorry, we had a problem restoring your database password. Please try again.' ),
		{
			duration: 5000,
		}
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/index.js', {
	[ HOSTING_RESTORE_DATABASE_PASSWORD ]: [
		dispatchRequest( {
			fetch: requestRestoreDatabasePassword,
			onSuccess: receiveRestoreDatabasePasswordSuccess,
			onError: receiveRestoreDatabasePasswordError,
		} ),
	],
} );

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOSTING_REQUEST_SFTP_USER } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { receiveSFTPUser } from 'state/hosting/actions.js';

const requestSFTPUser = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/ssh-user`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const receiveSFTPUserSuccess = ( action, response ) =>
	receiveSFTPUser( action.siteId, action.userId, response );

const receiveSFTPUserError = () => {
	return errorNotice(
		translate( 'Sorry, we had a problem retrieving your sftp user details. Please try again.' ),
		{
			duration: 5000,
		}
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/sftp-user.js', {
	[ HOSTING_REQUEST_SFTP_USER ]: [
		dispatchRequest( {
			fetch: requestSFTPUser,
			onSuccess: receiveSFTPUserSuccess,
			onError: receiveSFTPUserError,
		} ),
	],
} );

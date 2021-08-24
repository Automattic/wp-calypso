import { translate } from 'i18n-calypso';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GSUITE_USERS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	receiveGetGSuiteUsersSuccess,
	receiveGetGSuiteUsersFailure,
} from 'calypso/state/gsuite-users/actions';
import { errorNotice } from 'calypso/state/notices/actions';

export const getGSuiteUsers = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/google-apps`,
		},
		action
	);
};

export const getGSuiteUsersFailure = ( action, error ) => {
	return [
		errorNotice(
			translate( 'Failed to retrieve %(googleMailService)s users', {
				args: {
					googleMailService: getGoogleMailServiceFamily(),
				},
				comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
			} )
		),
		receiveGetGSuiteUsersFailure( action.siteId, error ),
	];
};

export const getGSuiteUsersSuccess = ( action, response ) => {
	if ( response ) {
		return receiveGetGSuiteUsersSuccess( action.siteId, response );
	}
	return getGSuiteUsersFailure( action, { message: 'No response.' } );
};

registerHandlers( 'state/data-layer/wpcom/gsuite-users/index.js', {
	[ GSUITE_USERS_REQUEST ]: [
		dispatchRequest( {
			fetch: getGSuiteUsers,
			onSuccess: getGSuiteUsersSuccess,
			onError: getGSuiteUsersFailure,
		} ),
	],
} );

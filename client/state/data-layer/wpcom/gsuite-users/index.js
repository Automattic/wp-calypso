/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { GSUITE_USERS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetGSuiteUsersSuccess,
	receiveGetGSuiteUsersFailure,
} from 'state/gsuite-users/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

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
		errorNotice( translate( 'Failed to retrieve G Suite Users' ) ),
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

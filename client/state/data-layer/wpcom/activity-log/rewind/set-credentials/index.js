/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_SET_CREDENTIALS } from 'state/action-types';
import {
	rewindSetCredentialsError,
	rewindSetCredentialsSuccess
} from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const requestSetCredentials = ( { dispatch }, action ) => {
	console.log( 'HTTP Request to set-credentials:', action );
	dispatch( http( {
		apiVersion: 1,
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/update-credentials/$( action.role }`,
		body: {
			credentials: action.credentials
		}
	}, action ) );
};

export const receiveSetCredentialsSuccess = ( { dispatch }, { siteId }, apiData ) => {
	console.log( 'HTTP Response to set-credentials:', apiData );
	dispatch( rewindSetCredentialsSuccess(
		siteId,
		apiData
	) );
};

export const receiveSetCredentialsError = ( { dispatch }, { siteId }, apiError ) => {
	console.log( 'HTTP Error from set-credentials:', apiError );
	dispatch( rewindSetCredentialsError(
		siteId,
		apiError
	) );
};

export default {
	[ REWIND_SET_CREDENTIALS ]: [ dispatchRequest(
		requestSetCredentials,
		receiveSetCredentialsSuccess,
		receiveSetCredentialsError
	) ],
};
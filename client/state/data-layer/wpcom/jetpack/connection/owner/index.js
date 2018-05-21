/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_CONNECTION_CHANGE_OWNER } from 'state/action-types';
import { requestJetpackUserConnectionData } from 'state/jetpack/connection/actions';

const changeConnectionOwner = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/jetpack-blogs/' + action.siteId + '/rest-api/',
			body: {
				path: '/jetpack/v4/connection/owner/',
				body: JSON.stringify( { owner: action.newOwnerDotorgId } ),
				json: true,
			},
		},
		action
	);

const handleSuccess = ( { newOwnerWpcomDisplayName, siteId } ) => {
	return dispatch => {
		dispatch(
			successNotice(
				translate( 'Connection owner changed to %(user)s.', {
					args: { user: newOwnerWpcomDisplayName },
				} )
			)
		);
		dispatch( requestJetpackUserConnectionData( siteId ) );
	};
};

const handleError = ( { newOwnerWpcomDisplayName } ) => {
	return errorNotice(
		translate( 'Connection owner could not be changed to %(user)s. Please contact support.', {
			args: { user: newOwnerWpcomDisplayName },
		} )
	);
};

export default {
	[ JETPACK_CONNECTION_CHANGE_OWNER ]: [
		dispatchRequestEx( {
			fetch: changeConnectionOwner,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
};

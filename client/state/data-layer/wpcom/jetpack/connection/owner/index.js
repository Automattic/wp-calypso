/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_USER_CONNECTION_CHANGE_OWNER } from 'state/action-types';
import { requestJetpackUserConnectionData } from 'state/jetpack/connection/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const changeConnectionOwner = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/jetpack-blogs/' + action.siteId + '/rest-api/',
			body: {
				path: '/jetpack/v4/connection/owner/',
				body: JSON.stringify( { owner: action.newOwnerWporgId } ),
				json: true,
			},
		},
		action
	);

const handleSuccess = ( { newOwnerWpcomDisplayName, siteId } ) => [
	successNotice(
		translate( 'Site owner changed to %(user)s.', {
			args: { user: newOwnerWpcomDisplayName },
		} )
	),
	requestJetpackUserConnectionData( siteId ),
];

const handleError = ( { newOwnerWpcomDisplayName } ) =>
	errorNotice(
		translate( 'Site owner could not be changed to %(user)s. Please contact support.', {
			args: { user: newOwnerWpcomDisplayName },
		} )
	);

registerHandlers( 'state/data-layer/wpcom/jetpack/connection/owner/index.js', {
	[ JETPACK_USER_CONNECTION_CHANGE_OWNER ]: [
		dispatchRequest( {
			fetch: changeConnectionOwner,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );

export default {};

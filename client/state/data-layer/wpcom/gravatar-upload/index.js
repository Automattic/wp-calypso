/**
 * Internal dependencies
 */

import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function uploadGravatar( action ) {
	const { email, file } = action;
	return http(
		{
			method: 'POST',
			path: '/gravatar-upload',
			body: {},
			apiNamespace: 'wpcom/v2',
			formData: [
				[ 'account', email ],
				[ 'filedata', file ],
			],
		},
		action
	);
}

export function announceSuccess( { file } ) {
	return ( dispatch ) => {
		const fileReader = new FileReader();
		fileReader.addEventListener( 'load', () => {
			dispatch( {
				type: GRAVATAR_UPLOAD_RECEIVE,
				src: fileReader.result,
			} );
			dispatch(
				withAnalytics( recordTracksEvent( 'calypso_edit_gravatar_upload_success' ), {
					type: GRAVATAR_UPLOAD_REQUEST_SUCCESS,
				} )
			);
		} );
		fileReader.readAsDataURL( file );
	};
}

export function announceFailure() {
	return withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_edit_gravatar_upload_failure' ),
			bumpStat( 'calypso_gravatar_update_error', 'unsuccessful_http_response' )
		),
		{ type: GRAVATAR_UPLOAD_REQUEST_FAILURE }
	);
}

registerHandlers( 'state/data-layer/wpcom/gravatar-upload/index.js', {
	[ GRAVATAR_UPLOAD_REQUEST ]: [
		dispatchRequest( {
			fetch: uploadGravatar,
			onSuccess: announceSuccess,
			onError: announceFailure,
		} ),
	],
} );

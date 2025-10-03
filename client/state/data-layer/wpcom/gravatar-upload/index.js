import { translate } from 'i18n-calypso';
import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	GRAVATAR_DETAILS_RECEIVE,
} from 'calypso/state/action-types';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { dispatchProfileCompleteNotice } from 'calypso/state/reader/onboarding/handlers';

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
			dispatch(
				successNotice(
					translate( 'You successfully uploaded a new profile photo — looking sharp!' ),
					{
						id: 'gravatar-upload',
					}
				)
			);
		} );
		fileReader.readAsDataURL( file );
	};
}

export function announceFailure() {
	return [
		withAnalytics(
			composeAnalytics(
				recordTracksEvent( 'calypso_edit_gravatar_upload_failure' ),
				bumpStat( 'calypso_gravatar_update_error', 'unsuccessful_http_response' )
			),
			{ type: GRAVATAR_UPLOAD_REQUEST_FAILURE }
		),
		errorNotice(
			translate( 'Hmm, your new profile photo was not saved. Please try uploading again.' ),
			{
				id: 'gravatar-upload',
			}
		),
	];
}

registerHandlers( 'state/data-layer/wpcom/gravatar-upload/index.js', {
	[ GRAVATAR_UPLOAD_REQUEST ]: [
		dispatchRequest( {
			fetch: uploadGravatar,
			onSuccess: announceSuccess,
			onError: announceFailure,
		} ),
	],
	[ GRAVATAR_UPLOAD_REQUEST_SUCCESS ]: [ dispatchProfileCompleteNotice ],
	[ GRAVATAR_DETAILS_RECEIVE ]: [ dispatchProfileCompleteNotice ],
} );

/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE
} from 'state/action-types';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

export function uploadGravatar( file, bearerToken, email ) {
	return dispatch => {
		dispatch( withAnalytics(
			recordTracksEvent( 'calypso_edit_gravatar_upload_start' ),
			{ type: GRAVATAR_UPLOAD_REQUEST }
		) );

		const data = new FormData();
		data.append( 'filedata', file );
		data.append( 'account', email );
		return request
			.post( 'https://api.gravatar.com/v1/upload-image' )
			.send( data )
			.set( 'Authorization', 'Bearer ' + bearerToken )
			.then( () => {
				const fileReader = new FileReader( file );
				fileReader.addEventListener( 'load', function() {
					dispatch( {
						type: GRAVATAR_UPLOAD_RECEIVE,
						src: fileReader.result,
					} );
					dispatch( withAnalytics(
						recordTracksEvent( 'calypso_edit_gravatar_upload_success' ),
						{ type: GRAVATAR_UPLOAD_REQUEST_SUCCESS }
					) );
				} );
				fileReader.readAsDataURL( file );
			} )
			.catch( () => {
				dispatch( withAnalytics(
					composeAnalytics(
						recordTracksEvent( 'calypso_edit_gravatar_upload_failure' ),
						bumpStat( 'calypso_gravatar_update_error', 'unsuccessful_http_response' )
					),
					{ type: GRAVATAR_UPLOAD_REQUEST_FAILURE }
				) );
			} );
	};
}

export const receiveGravatarImageFailed = ( { errorMessage, statName } ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_edit_gravatar_file_recieve_failure' ),
			bumpStat( 'calypso_gravatar_update_error', statName )
		),
		{
			type: GRAVATAR_RECEIVE_IMAGE_FAILURE,
			errorMessage,
		}
	);

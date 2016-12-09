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

export function uploadGravatar( file, bearerToken, email ) {
	return dispatch => {
		dispatch( { type: GRAVATAR_UPLOAD_REQUEST } );
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
					dispatch( {
						type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
					} );
				} );
				fileReader.readAsDataURL( file );
			} )
			.catch( () => {
				dispatch( {
					type: GRAVATAR_UPLOAD_REQUEST_FAILURE
				} );
			} );
	};
}

export function receiveGravatarImageFailed( errorMessage ) {
	return {
		type: GRAVATAR_RECEIVE_IMAGE_FAILURE,
		errorMessage
	};
}

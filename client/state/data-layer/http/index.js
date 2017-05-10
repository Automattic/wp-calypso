/**
 * External dependencies
 */
import superagent from 'superagent';

/***
 * Internal dependencies
 */
import { extendAction } from 'state/utils';
import { HTTP_REQUEST } from 'state/action-types';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';

const httpHandler = ( { dispatch }, action ) => {
	const {
		url,
		method,
		headers,
		body,
		withCredentials,
		onSuccess,
		onFailure
	} = action;

	let request = superagent( method, url );

	if ( withCredentials ) {
		request = request.withCredentials();
	}

	headers.forEach( header => request = request.set( header.key, header.value ) );

	request = request.accept( 'application/json' );

	if ( body ) {
		request = request.send( body );
	}

	return request.then( data =>
		dispatch( extendAction( onSuccess, successMeta( data ) ) )
	).catch( error =>
		dispatch( extendAction( onFailure, failureMeta( error ) ) )
	);
};

export default {
	[ HTTP_REQUEST ]: [ httpHandler ]
};

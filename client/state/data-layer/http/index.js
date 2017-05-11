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

/***
 * Handler to perorm an http request based on `HTTP_REQUEST` action parameters:
 * {String} url the url to request
 * {String} method the method we should use in the request: GET, POST etc.
 * {Array<{Object}>} headers array of { key: '', value: '' } pairs for the request headers
 * {Object} body data send as body
 * {Boolean} withCredentials save cookie set on request
 * {Action} onSuccess action to dispatch on success with data meta
 * {Action} onFailure action to dispatch on failure with error meta
 *
 * @param {Function} dispatch redux store dispatch
 * @param {Function} action dispathed action we need to handle
 * @returns {Promise} promise of the handled request
 */
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
	).catch( error => {
		dispatch( extendAction( onFailure, failureMeta( error ) ) );
		return Promise.reject( error );
	} );
};

export default {
	[ HTTP_REQUEST ]: [ httpHandler ]
};

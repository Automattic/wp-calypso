/**
 * Internal dependencies
 */
import * as request from './request';

export * as url from './url';

const handleError = ( jsonError ) => {
	if ( jsonError.data.message ) {
		throw jsonError.data.message;
	}

	throw JSON.stringify( jsonError );
};

export const post = ( url, data ) => request.post( url, data ).catch( handleError );

export const get = ( url ) => request.get( url ).catch( handleError );

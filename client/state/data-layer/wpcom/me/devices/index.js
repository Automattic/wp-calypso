/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const requestUserDevices = function( { dispatch }, action, next ) {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: '/notifications/devices',
	}, action ) );

	return next( action );
};

export const handleSuccess = ( { dispatch }, action, next, data ) => {
	dispatch( { type: '', data } );
};

export const handleError = ( { dispatch }, action, next, rawError ) => {
	dispatch( {
		type: '',
		message: rawError.message,
	} );
};

export default {
	[ '' ]: [ dispatchRequest( requestUserDevices, handleSuccess, handleError ) ],
};

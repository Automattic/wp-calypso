import request from 'superagent';

import Dispatcher from 'dispatcher';
import { actions } from './constants';

let timeout;

export function resetCode() {
	timeout = null;
	Dispatcher.handleViewAction( {
		type: actions.RESET_AUTH_CODE_REQUEST
	} );
}

export function requestCode( username, password ) {
	if ( timeout ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: actions.AUTH_CODE_REQUEST
	} );

	request.post( '/sms' )
		.send( { username, password } )
		.end( ( error, data ) => {
			timeout = setTimeout( resetCode, 1000 * 30 );

			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_AUTH_CODE_REQUEST,
				data,
				error
			} );
		} );
}

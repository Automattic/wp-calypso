/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { actions } from './constants';

export function login( username, password, auth_code ) {
	Dispatcher.handleViewAction( {
		type: actions.AUTH_LOGIN
	} );

	request.post( '/oauth' )
		.send( { username, password, auth_code } )
		.end( ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_AUTH_LOGIN,
				data,
				error
			} );
		} );
}

/** @format */

/**
 * External dependencies
 */

import request from 'superagent';

/**
 * Internal dependencies
 */
import Dispatcher from 'client/dispatcher';
import { actions } from './constants';
import { errors as errorTypes } from './constants';
import analytics from 'client/lib/analytics';

export function login( username, password, auth_code ) {
	Dispatcher.handleViewAction( {
		type: actions.AUTH_LOGIN,
	} );

	request
		.post( '/oauth' )
		.send( { username, password, auth_code } )
		.end( ( error, data ) => {
			bumpStats( error, data );

			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_AUTH_LOGIN,
				data,
				error,
			} );
		} );
}

function bumpStats( error, data ) {
	let errorType;

	if ( error ) {
		if ( data && data.body ) {
			errorType = data.body.error;
		} else {
			errorType = 'status_' + error.status;
		}
	}

	if ( errorType === errorTypes.ERROR_REQUIRES_2FA ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_needs2fa' );
		analytics.mc.bumpStat( 'calypso_oauth_login', 'success-needs-2fa' );
	} else if ( errorType ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_fail', {
			error: error.error,
		} );

		analytics.mc.bumpStat( {
			calypso_oauth_login_error: errorType,
			calypso_oauth_login: 'error',
		} );
	} else {
		analytics.tracks.recordEvent( 'calypso_oauth_login_success' );
		analytics.mc.bumpStat( 'calypso_oauth_login', 'success' );
	}
}

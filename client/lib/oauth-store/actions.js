/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { actions } from './constants';
import { errors as errorTypes } from './constants';
import analytics from 'lib/analytics';

function oauthLogin( username, password, secondFactor ) {
	request.post( '/oauth' )
		.send( { username, password, ...secondFactor } )
		.end( ( error, data ) => {
			bumpStats( error, data );

			Dispatcher.handleServerAction( {
				type: actions.RECEIVE_AUTH_LOGIN,
				data,
				error
			} );
		} );
}

export function pushAuthLogin( username, password, secondFactor ) {
	oauthLogin( username, password, secondFactor );
}

export function login( username, password, secondFactor ) {
	Dispatcher.handleViewAction( {
		type: actions.AUTH_LOGIN
	} );

	oauthLogin( username, password, secondFactor );
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

	if ( errorType === errorTypes.ERROR_REQUIRES_2FA ||
		errorType === errorTypes.ERROR_REQUIRES_2FA_PUSH_VERIFICATION ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_needs2fa' );
		analytics.mc.bumpStat( 'calypso_oauth_login', 'success-needs-2fa' );
	} else if ( errorType ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_fail', {
			error: error.error
		} );

		analytics.mc.bumpStat( {
			calypso_oauth_login_error: errorType,
			calypso_oauth_login: 'error'
		} );
	} else {
		analytics.tracks.recordEvent( 'calypso_oauth_login_success' );
		analytics.mc.bumpStat( 'calypso_oauth_login', 'success' );
	}
}

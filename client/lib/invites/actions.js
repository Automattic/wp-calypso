/**
 * External dependencies
 */
import Debug from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import { action as ActionTypes } from 'lib/invites/constants';
import analytics from 'analytics';
import { errorNotice, successNotice } from 'state/notices/actions';
import { acceptedNotice } from 'my-sites/invites/utils';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invites-actions' );

export function fetchInvites( siteId, number = 100, offset = 0 ) {
	debug( 'fetchInvites', siteId );

	Dispatcher.handleViewAction( {
		type: ActionTypes.FETCH_INVITES,
		siteId,
		offset
	} );

	wpcom.undocumented().invitesList( siteId, number, offset, function( error, data ) {
		Dispatcher.handleServerAction( {
			type: error ? ActionTypes.RECEIVE_INVITES_ERROR : ActionTypes.RECEIVE_INVITES,
			siteId, offset, data, error
		} );
	} );
}

export function fetchInvite( siteId, inviteKey ) {
	debug( 'fetchInvite', siteId, inviteKey );

	Dispatcher.handleViewAction( {
		type: ActionTypes.FETCH_INVITE,
		siteId,
		inviteKey
	} );

	wpcom.undocumented().getInvite( siteId, inviteKey, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: error ? ActionTypes.RECEIVE_INVITE_ERROR : ActionTypes.RECEIVE_INVITE,
			siteId, inviteKey, data, error
		} );

		if ( error ) {
			analytics.tracks.recordEvent( 'calypso_invite_validation_failure', {
				error: error.error
			} );
		}
	} );
}

export function createAccount( userData, invite, callback ) {
	const send_verification_email = ( userData.email !== invite.sentTo );

	return dispatch => {
		wpcom.undocumented().usersNew(
			Object.assign( {}, userData, { validate: false, send_verification_email } ),
			( error, response ) => {
				const bearerToken = response && response.bearer_token;
				if ( error ) {
					if ( error.message ) {
						dispatch( errorNotice( error.message ) );
					}
					analytics.tracks.recordEvent( 'calypso_invite_account_creation_failed', {
						error: error.error
					} );
				} else {
					analytics.tracks.recordEvent( 'calypso_invite_account_created' );
				}
				callback( error, bearerToken );
			}
		);
	}
}

export function acceptInvite( invite, callback ) {
	return dispatch => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.INVITE_ACCEPTED,
			invite
		} );
		wpcom.undocumented().acceptInvite(
			invite,
			( error, data ) => {
				Dispatcher.handleViewAction( {
					type: error ? ActionTypes.RECEIVE_INVITE_ACCEPTED_ERROR : ActionTypes.RECEIVE_INVITE_ACCEPTED_SUCCESS,
					error,
					invite,
					data
				} );
				if ( error ) {
					if ( error.message ) {
						dispatch( errorNotice( error.message, { displayOnNextPage: true } ) );
					}
					analytics.tracks.recordEvent( 'calypso_invite_accept_failed', {
						error: error.error
					} );
				} else {
					dispatch( successNotice( ... acceptedNotice( invite ) ) );
					analytics.tracks.recordEvent( 'calypso_invite_accepted' );
				}
				if ( typeof callback === 'function' ) {
					callback( error, data );
				}
			}
		);
	}
}

export function sendInvites( siteId, usernamesOrEmails, role, message, callback ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SENDING_INVITES,
		siteId, usernamesOrEmails, role, message
	} );
	wpcom.undocumented().sendInvites( siteId, usernamesOrEmails, role, message, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: error ? ActionTypes.RECEIVE_SENDING_INVITES_ERROR : ActionTypes.RECEIVE_SENDING_INVITES_SUCCESS,
			error,
			siteId,
			usernamesOrEmails,
			role,
			message,
			data
		} );
		if ( error ) {
			analytics.tracks.recordEvent( 'calypso_invite_send_failed' );
		} else {
			analytics.tracks.recordEvent( 'calypso_invite_send_success' );
		}
		callback( error, data );
	} );
}

export function createInviteValidation( siteId, usernamesOrEmails, role ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CREATE_INVITE_VALIDATION,
		siteId, usernamesOrEmails, role
	} );
	wpcom.undocumented().createInviteValidation( siteId, usernamesOrEmails, role, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: error ? ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_ERROR : ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS,
			error,
			siteId,
			usernamesOrEmails,
			role,
			data
		} );
		if ( error ) {
			analytics.tracks.recordEvent( 'calypso_invite_create_validation_failed' );
		} else {
			analytics.tracks.recordEvent( 'calypso_invite_create_validation_success' );
		}
	} );
}

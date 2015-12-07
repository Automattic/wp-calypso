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
	} );
}

export function createAccount( userData, callback ) {
	return wpcom.undocumented().usersNew(
		Object.assign( {}, userData, { validate: false } ),
		( error, response ) => {
			const bearerToken = response && response.bearer_token;
			callback( error, bearerToken );
		}
	);
}

export function acceptInvite( invite ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.INVITE_ACCEPTED,
		invite
	} );
	wpcom.undocumented().acceptInvite(
		invite,
		( error, data ) => {
			Dispatcher.handleViewAction( {
				type: error ? ActionTypes.INVITE_ACCEPTED_ERROR : ActionTypes.INVITE_ACCEPTED_SUCCESFUL,
				error,
				invite,
				data
			} );
		}
	);
}

export function displayInviteAccepted( invite ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.DISPLAY_INVITE_ACCEPTED_NOTICE,
		invite
	} );
}

export function dismissInviteAccepted() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.DISMISS_INVITE_ACCEPTED_NOTICE
	} );
}

export function displayInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.DISPLAY_INVITE_DECLINED_NOTICE
	} );
}

export function dismissInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.DISMISS_INVITE_DECLINED_NOTICE
	} );
}

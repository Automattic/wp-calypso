/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp' ;
import Dispatcher from 'dispatcher';
import { DISPLAY_INVITE_ACCEPTED, DISPLAY_INVITE_ACCEPTED_DISMISS, DISPLAY_INVITE_DECLINED, DISPLAY_INVITE_DECLINED_DISMISS } from './invite-message/constants'

export function createAccount( userData, callback ) {
	return wpcom.undocumented().usersNew(
		Object.assign( {}, userData, { validate: false } ),
		( error, response ) => {
			const bearerToken = response && response.bearer_token;
			callback( error, bearerToken );
		}
	);
}

export function acceptInvite( invite, bearerToken, callback ) {
	wpcom.loadToken( bearerToken );
	return wpcom.undocumented().acceptInvite(
		invite.blog_id,
		invite.invite_slug,
		callback
	);
}

export function displayInviteAccepted() {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_ACCEPTED
	} );
}

export function dismissInviteAccepted() {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_ACCEPTED_DISMISS
	} );
}

export function displayInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_DECLINED
	} );
}

export function dismissInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_DECLINED_DISMISS
	} );
}

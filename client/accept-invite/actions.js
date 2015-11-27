/**
 * Internal dependencies
 */
import wpcom from 'lib/wp' ;
import Dispatcher from 'dispatcher';
import { DISPLAY_INVITE_ACCEPTED_NOTICE, DISMISS_INVITE_ACCEPTED_NOTICE, DISPLAY_INVITE_DECLINED_NOTICE, DISMISS_INVITE_DECLINED_NOTICE } from './invite-message/constants'

export function createAccount( userData, callback ) {
	return wpcom.undocumented().usersNew(
		Object.assign( {}, userData, { validate: false } ),
		( error, response ) => {
			const bearerToken = response && response.bearer_token;
			callback( error, bearerToken );
		}
	);
}

export function acceptInvite( invite, callback, bearerToken ) {
	if ( bearerToken ) {
		wpcom.loadToken( bearerToken );
	}
	return wpcom.undocumented().acceptInvite(
		invite.blog_id,
		invite.invite_slug,
		callback
	);
}

export function displayInviteAccepted( siteId ) {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_ACCEPTED_NOTICE,
		siteId
	} );
}

export function dismissInviteAccepted() {
	Dispatcher.handleViewAction( {
		type: DISMISS_INVITE_ACCEPTED_NOTICE
	} );
}

export function displayInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: DISPLAY_INVITE_DECLINED_NOTICE
	} );
}

export function dismissInviteDeclined() {
	Dispatcher.handleViewAction( {
		type: DISMISS_INVITE_DECLINED_NOTICE
	} );
}

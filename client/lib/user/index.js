/**
 * External Dependencies
 */
import Dispatcher from 'dispatcher';

/**
 * Internal Dependencies
 */
import { action as InvitesActionTypes } from 'lib/invites/constants';
import User from './user';
let _user = false;

module.exports = function() {
	if ( ! _user ) {
		_user = new User();
	}
	return _user;
};

User.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;
	switch ( action.type ) {
		case 'RECEIVE_DELETED_SITE':
			decrementSiteCount();
			_user.fetch();
			break;
		case InvitesActionTypes.INVITE_ACCEPTED:
			if ( [ 'follower', 'viewer' ].indexOf( action.invite.role ) === -1 ) {
				incrementSiteCount();
			}
			break;
	}
} );

function decrementSiteCount() {
	let data = _user.get(),
		attributes = {
			visible_site_count: data.visible_site_count - 1,
			site_count: data.site_count - 1
		};
	_user.set( attributes );
}

function incrementSiteCount() {
	const data = _user.get(),
		attributes = {
			visible_site_count: data.visible_site_count + 1,
			site_count: data.site_count + 1
		};
	_user.set( attributes );
}

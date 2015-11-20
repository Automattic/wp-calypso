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

const InvitesActions = {
	fetchInvites( siteId, number = 100, offset = 0 ) {
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
	},
	fetchInvite( siteId, inviteKey ) {
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
};

export default InvitesActions;

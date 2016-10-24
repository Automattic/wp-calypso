/**
 * Internal Dependencies
 */
import { action as InvitesActionTypes } from 'lib/invites/constants';
import { JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST } from 'state/action-types';

var SitesList = require( './list' ),
	PollerPool = require( 'lib/data-poller' ),
	Dispatcher = require( 'dispatcher' ),
	_sites;

module.exports = function() {
	if ( ! _sites ) {
		_sites = new SitesList();
		PollerPool.add( _sites, 'fetch' );

		_sites.dispatchToken = Dispatcher.register( function( payload ) {
			var action = payload.action;
			switch ( action.type ) {
				case 'DISCONNECT_SITE':
				case 'RECEIVE_DELETED_SITE':
					_sites.removeSite( action.site );
					break;
				case InvitesActionTypes.RECEIVE_INVITE_ACCEPTED_SUCCESS:
					if ( [ 'follower', 'viewer' ].indexOf( action.invite.role ) === -1 ) {
						_sites.sync( action.data );
					}
					break;
				case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
					_sites.sync( action.data );
					break;
				case 'RECEIVE_DISCONNECTED_SITE':
				case 'FETCH_SITES':
					_sites.fetch(); // refetch the sites from .com
					break;
				case 'TRANSACTION_STEP_SET':
					if ( 'received-wpcom-response' === action.step.name && action.step.data ) {
						_sites.updatePlans( action.step.data.purchases );
					}
					break;
			}
		} );
	}
	return _sites;
};

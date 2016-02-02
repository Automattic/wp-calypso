/**
 * Internal Dependencies
 */
import { action as InvitesActionTypes } from 'lib/invites/constants';
import SitesList from './list';
import PollerPool from 'lib/data-poller';
import Dispatcher from 'dispatcher';

var sites;

module.exports = function() {
	if ( ! sites ) {
		sites = new SitesList();
		PollerPool.add( sites, 'fetch' );

		sites.dispatchToken = Dispatcher.register( function( payload ) {
			var action = payload.action;
			switch ( action.type ) {
				case 'DISCONNECT_SITE':
				case 'RECEIVE_DELETED_SITE':
					sites.removeSite( action.site );
					break;
				case InvitesActionTypes.RECEIVE_INVITE_ACCEPTED_SUCCESS:
					if ( [ 'follower', 'viewer' ].indexOf( action.invite.role ) === -1 ) {
						sites.sync( action.data );
					}
					break;
				case 'RECEIVE_DISCONNECTED_SITE':
				case 'FETCH_SITES':
					sites.fetch(); // refetch the sites from .com
					break;
				case 'TRANSACTION_STEP_SET':
					if ( 'received-wpcom-response' === action.step.name && action.step.data ) {
						sites.updatePlans( action.step.data.purchases );
					}
					break;
			}
		} );
	}
	return sites;
};

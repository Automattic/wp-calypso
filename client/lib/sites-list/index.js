/**
 * Internal Dependencies
 */
import { action as InvitesActionTypes } from 'lib/invites/constants';
import clone from 'lodash/lang/clone';


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
				case InvitesActionTypes.INVITE_ACCEPTED:
					let sites = clone( _sites.get() );
					if ( sites.length === 0 ) {
						action.invite.site.primary = true;
					}
					sites.push( action.invite.site );
					_sites.update( sites );
					break;
				case InvitesActionTypes.INVITE_ACCEPTED_SUCCESS:
				case 'RECEIVE_DISCONNECTED_SITE':
				case 'RECEIVE_DELETED_SITE':
				case 'FETCH_SITES':
					_sites.fetch(); // refetch the sites from .com
					break;
			}
		} );
	}
	return _sites;
};

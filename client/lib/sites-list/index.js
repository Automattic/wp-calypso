/** @format */

/**
 * Internal dependencies
 */

import SitesList from './list';
import PollerPool from 'lib/data-poller';
import Dispatcher from 'dispatcher';
let _sites;

export default function() {
	if ( ! _sites ) {
		_sites = new SitesList();
		PollerPool.add( _sites, 'fetch' );

		_sites.dispatchToken = Dispatcher.register( function( payload ) {
			const action = payload.action;
			switch ( action.type ) {
				case 'RECEIVE_DELETED_SITE':
					_sites.removeSite( action.site );
					break;
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
}

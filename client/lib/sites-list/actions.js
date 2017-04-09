/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:sites-list:actions' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

const SitesListActions = {
	removeSitesNotices( logs ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_SITES_NOTICES',
			logs
		} );
	},
	// A way to remove a Disconnected Site from the old list store
	disconnectedSite( site ) {
		Dispatcher.handleViewAction( {
			type: 'DISCONNECT_SITE',
			site
		} );
	},

	deleteSite( site, onComplete ) {
		Dispatcher.handleViewAction( {
			type: 'DELETE_SITE',
			site: site
		} );

		debug( 'Deleting site', site );

		wpcom.undocumented().deleteSite( site.ID, function( error ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETED_SITE_ERROR',
					error
				} );
			} else {
				SitesListActions.receiveDeletedSite( site );
			}

			onComplete( error );
		} );
	},

	receiveDeletedSite( site ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_DELETED_SITE',
			site
		} );
	},

	clearDeleteSiteStore() {
		Dispatcher.handleViewAction( { type: 'CLEAR_DELETED_SITE' } );
	}
};

export default SitesListActions;

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

	disconnect( site ) {
		debug( 'disconnect site', site );

		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'DISCONNECT_SITE',
				action: 'DISCONNECT_SITE',
				site
			} );

			wpcom.undocumented().disconnectJetpack( site.ID, function( error, data ) {
				Dispatcher.handleViewAction( {
					type: 'RECEIVE_DISCONNECTED_SITE',
					action: 'DISCONNECT_SITE',
					site,
					error,
					data
				} );
			} );
		} else {
			Dispatcher.handleViewAction( {
				type: 'DISCONNECTING_SITE_ERROR',
				action: 'DISCONNECT_SITE',
				site,
				error: { error: 'unauthorized_access' }
			} );
		}
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
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETED_SITE',
					site
				} );
			}

			onComplete( error );
		} );
	},

	receiveDeletedSite( error, site ) {
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

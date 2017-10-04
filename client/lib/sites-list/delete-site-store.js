/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

import Emitter from 'lib/mixins/emitter';

var _deletedSite = {},
	DeletedSiteStore;

function storeDeletedSite( site ) {
	_deletedSite = {
		status: 'deleting',
		site: site
	};
	DeletedSiteStore.emit( 'change' );
}

function handleDeleteSiteResponse( error ) {
	_deletedSite.status = ( error ) ? 'error' : 'deleted';
	DeletedSiteStore.emit( 'change' );
}

function clearDeletedSite() {
	_deletedSite = {};
	DeletedSiteStore.emit( 'change' );
}

DeletedSiteStore = {
	get: function() {
		return _deletedSite;
	}
};

Emitter( DeletedSiteStore );

DeletedSiteStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	switch ( action.type ) {
		case 'DELETE_SITE':
			storeDeletedSite( action.site );
			break;
		case 'RECEIVE_DELETED_SITE_ERROR':
			handleDeleteSiteResponse( action.error );
			break;
		case 'RECEIVE_DELETED_SITE':
			handleDeleteSiteResponse();
			break;
		case 'CLEAR_DELETED_SITE':
			clearDeletedSite();
			break;
	}
} );

module.exports = DeletedSiteStore;

// Reader Site Block Store

// External Dependencies
//var debug = require( 'debug' )( 'calypso:reader:site-blocks' );

var Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/reject' ),
	find = require( 'lodash/find' ),
	findLast = require( 'lodash/findLast' );

// Internal Dependencies
var emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error;

var blockedSites = [],
	errors = [];

var SiteBlockStore = {

	getIsBlocked: function( siteId ) {
		var isBlocked = false;
		if ( find( blockedSites, { siteId: siteId } ) ) {
			isBlocked = true;
		}
		return isBlocked;
	},

	receiveBlock: function( action ) {
		SiteBlockStore.addBlockedSite( action.data.siteId );
	},

	receiveUnblock: function( action ) {
		SiteBlockStore.removeBlockedSite( action.data.siteId );
	},

	receiveBlockResponse: function( action ) {
		if ( ! action.error && action.data && action.data.success ) {
			// The block worked - discard any existing errors for this site
			SiteBlockStore.removeErrorsForSite( action.siteId );
			return;
		}

		errors.push( {
			siteId: action.siteId,
			errorType: ErrorTypes.UNABLE_TO_BLOCK,
			timestamp: Date.now()
		} );

		// There was a problem - remove the block again
		SiteBlockStore.removeBlockedSite( action.siteId );
	},

	receiveUnblockResponse: function( action ) {
		if ( ! action.error && action.data && action.data.success ) {
			// The unblock worked - discard any existing errors for this site
			SiteBlockStore.removeErrorsForSite( action.siteId );
			return;
		}

		errors.push( {
			siteId: action.siteId,
			errorType: ErrorTypes.UNABLE_TO_UNBLOCK,
			timestamp: Date.now()
		} );

		// There was a problem - add the block again
		SiteBlockStore.addBlockedSite( action.siteId );
	},

	addBlockedSite: function( siteId ) {
		blockedSites.push( { siteId: siteId } );

		SiteBlockStore.emit( 'change' );
		SiteBlockStore.emit( 'block', siteId );

		return true;
	},

	removeBlockedSite: function( siteId ) {
		var newBlockedSites = reject( blockedSites, { siteId: siteId } );

		if ( newBlockedSites.length === blockedSites.length ) {
			return false;
		}

		blockedSites = newBlockedSites;

		SiteBlockStore.emit( 'change' );

		return true;
	},

	removeErrorsForSite: function( siteId ) {
		var newErrors = reject( errors, { siteId: siteId } );

		if ( newErrors.length === errors.length ) {
			return false;
		}

		errors = newErrors;

		return true;
	},

	getLastErrorBySite: function( siteId ) {
		var lastError = findLast( errors, { siteId: siteId } );

		if ( ! lastError ) {
			return null;
		}

		return lastError;
	},

	dismissError: function( error ) {
		this.removeErrorsForSite( error.data.siteId );
		SiteBlockStore.emit( 'change' );
	}

};

emitter( SiteBlockStore );

// Increase the max number of listeners from 10 to 100
SiteBlockStore.setMaxListeners( 100 );

SiteBlockStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.BLOCK_SITE:
			SiteBlockStore.receiveBlock( action );
			break;
		case ActionTypes.UNBLOCK_SITE:
			SiteBlockStore.receiveUnblock( action );
			break;
		case ActionTypes.RECEIVE_BLOCK_SITE:
			SiteBlockStore.receiveBlockResponse( action );
			break;
		case ActionTypes.RECEIVE_UNBLOCK_SITE:
			SiteBlockStore.receiveUnblockResponse( action );
			break;
		case ActionTypes.DISMISS_BLOCK_ERROR:
			SiteBlockStore.dismissError( action );
			break;

	}
} );

module.exports = SiteBlockStore;

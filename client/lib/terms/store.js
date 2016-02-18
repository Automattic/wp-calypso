/**
 * External dependencies
 */
var values = require( 'lodash/values' ),
	clone = require( 'lodash/clone' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action;

/**
* Module Variables
*/
var _terms = {},
	TermStore = {};

function receiveItems( siteId, items ) {
	if ( ! ( siteId in _terms ) ) {
		_terms[ siteId ] = {};
	}

	items.forEach( function( item ) {
		if ( item.temporaryId ) {
			delete _terms[ siteId ][ item.temporaryId ];
		}

		_terms[ siteId ][ item.ID ] = item;
	} );
}

TermStore.all = function( siteId ) {
	if ( ! ( siteId in _terms ) ) {
		return;
	}

	return values( _terms[ siteId ] );
};

TermStore.get = function( siteId, termId ) {
	if ( ! ( siteId in _terms ) ) {
		return;
	}

	return clone( _terms[ siteId ][ termId ] );
};

emitter( TermStore );

TermStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case ActionTypes.RECEIVE_TERMS:
		case ActionTypes.CREATE_TERM:
		case ActionTypes.RECEIVE_ADD_TERM:

			if ( action.error || ! action.siteId || ! action.data ) {
				break;
			}

			receiveItems( action.siteId, action.data.terms );
			TermStore.emit( 'change' );
			break;
	}

	return true;
} );

module.exports = TermStore;

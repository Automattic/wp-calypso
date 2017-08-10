/** @format */
/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:help-search:store' );

/**
 * Internal dependencies
 */
var createReducerStore = require( 'lib/store' ).createReducerStore,
	ActionTypes = require( './constants' ).action;

/**
 * Module variables
 */
var initialState = [];

var HelpSearchStore = createReducerStore( function( state, payload ) {
	var action = payload.action,
		newState;
	debug( 'register event Type', action.type, payload );

	switch ( action.type ) {
		case ActionTypes.SET_HELP_LINKS:
			newState = action.helpLinks;
			break;
		default:
			return state;
	}

	return newState;
}, initialState );

HelpSearchStore.getHelpLinks = function() {
	return HelpSearchStore.get();
};

module.exports = HelpSearchStore;

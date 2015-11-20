/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:happiness-engineers:store' );

/**
 * Internal dependencies
 */
var createReducerStore = require( 'lib/store' ).createReducerStore,
	ActionTypes = require( './constants' ).action;

/**
 * Module variables
 */
var initialState = [];

var HappinessEngineersStore = createReducerStore( function( state, payload ) {
	var action = payload.action,
		newState;
	debug( 'register event Type', action.type, payload );

	switch ( action.type ) {
		case ActionTypes.SET_HAPPPINESS_ENGINEERS:
			newState = action.happinessEngineers;
			break;
		default:
			return state;
	}

	return newState;
}, initialState );

HappinessEngineersStore.getHappinessEngineers = function() {
	return HappinessEngineersStore.get();
};

module.exports = HappinessEngineersStore;

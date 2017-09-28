/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:help-search:store' );

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';

import { action as ActionTypes } from './constants';

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

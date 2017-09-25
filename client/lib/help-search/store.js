/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from './constants';
import { createReducerStore } from 'lib/store';

const debug = debugFactory( 'calypso:help-search:store' );

/**
 * Module variables
 */
const initialState = [];

const HelpSearchStore = createReducerStore( function( state, payload ) {
	let action = payload.action,
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

export default HelpSearchStore;

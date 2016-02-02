/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { CONNECTION_LOST, CONNECTION_RESTORED, COMMAND_LINE_ARGUMENTS, COMMAND_LINE_ARGUMENTS_USED } from 'state/action-types';

export function connectionState( state = 'CHECKING', action ) {
	switch ( action.type ) {
		case CONNECTION_LOST:
			state = 'OFFLINE';
			break;
		case CONNECTION_RESTORED:
			state = 'ONLINE';
			break;
	}

	return state;
}

export function commandLineArguments( state = { _: [], argumentsUsed: false }, action ) {
	if ( action.type === COMMAND_LINE_ARGUMENTS ) {
		Object.assign( state, action.commandLineArguments, { argumentsUsed: false } );

		if ( includes( state._, 'post' ) ) {
			page.redirect( '/post/' + state.site );
		}
	}

	if ( action.type === COMMAND_LINE_ARGUMENTS_USED ) {
		state.argumentsUsed = true;
	}

	return state;
}

export default combineReducers( {
	connectionState,
	commandLineArguments
} );

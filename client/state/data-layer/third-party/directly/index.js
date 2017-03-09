/**
 * Internal dependencies
 */
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
} from 'state/action-types';
import {
	initializationCompleted,
	initializationFailed,
} from 'state/help/directly/actions';
import * as directly from 'lib/directly';

export function askQuestion( store, action, next ) {
	directly.askQuestion( action.questionText, action.name, action.email );
	next( action );
}

export function initialize( { dispatch }, action, next ) {
	next( action );

	return directly.initialize()
		.then( () => dispatch( initializationCompleted() ) )
		.catch( () => dispatch( initializationFailed() ) );
}

export default {
	[ DIRECTLY_ASK_QUESTION ]: [ askQuestion ],
	[ DIRECTLY_INITIALIZATION_START ]: [ initialize ],
};

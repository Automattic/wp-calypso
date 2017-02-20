/**
 * Internal dependencies
 */
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE,
} from 'state/action-types';
import * as directly from 'lib/directly';

export function askQuestion( store, action, next ) {
	directly.askQuestion( action.questionText, action.name, action.email );
	next( action );
}

export function initialize( store, action, next ) {
	directly.initialize();
	next( action );
}

export default {
	[ DIRECTLY_ASK_QUESTION ]: [ askQuestion ],
	[ DIRECTLY_INITIALIZE ]: [ initialize ],
};

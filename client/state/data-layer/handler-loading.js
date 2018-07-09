/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

export const state = {
	handlers: {}
};

const requiredHandlers = new Set();

export const requireHandlers = ( ...requires ) => {
	let nextHandlers = state.handlers;

	for ( const [ id, handlers ] in requires ) {
		if ( requiredHandlers.has( id ) ) {
			continue;
		}

		requiredHandlers.add( id );
		nextHandlers = mergeHandlers( nextHandlers, handlers );
	}

	if ( state.handlers !== nextHandlers ) {
		state.handlers = nextHandlers;
	}
};


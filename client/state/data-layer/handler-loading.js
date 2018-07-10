/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

export const state = {
	handlers: {},
};

const requiredHandlers = new Set();

export const registerHandlers = ( ...requires ) => {
	let nextHandlers = state.handlers;

	requires.forEach( ( [ id, handlers ] ) => {
		if ( requiredHandlers.has( id ) ) {
			return;
		}

		requiredHandlers.add( id );
		nextHandlers = mergeHandlers( nextHandlers, handlers );
	} );

	if ( state.handlers !== nextHandlers ) {
		state.handlers = nextHandlers;
	}
};

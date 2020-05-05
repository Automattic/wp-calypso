/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

/** Stores lists of handlers by action type */
let registeredHandlers = {};

/** Stores names of already-included handler sets */
const registeredNames = new Set();

/**
 * Loads action handlers into the data layer
 *
 * @param {string} id name of handler set
 * @param {object<string, Array<Function>>} handlers set of handlers to inject
 */
export const registerHandlers = ( id, handlers ) => {
	if ( registeredNames.has( id ) ) {
		return;
	}

	registeredNames.add( id );
	registeredHandlers = mergeHandlers( registeredHandlers, handlers );
};

/**
 * Returns list of handlers for given action type else undefined
 *
 * @param {string} actionType requested action type
 * @returns {?Array<Function>} list of handlers for type
 */
export const getHandlers = ( actionType ) => registeredHandlers[ actionType ];

/**
 * For testing only: reset handlers
 */
export const testReset = () => {
	if ( 'test' === process.env.NODE_ENV ) {
		registeredHandlers = {};
		registeredNames.clear();
	}
};

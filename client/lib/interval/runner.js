/** @format */
/**
 * External dependencies
 */
import { filter, forEach, reject, some } from 'lodash';
/**
 *  Global interval action runner
 *
 *  This module contains both a store for keeping track of
 *  actions that need to run at intervals and the code used
 *  to execute those actions.
 *
 *  Note: this is not a Flux or a Redux model and the store
 *  of actions here isn't intended to be exported higher up
 *  in the application. This module is a singleton that should
 *  work concurrently for multiple callers from the `<Interval />`
 *  component.
 *
 *  # Basic operation
 *
 *  The store keeps track of actions as they are added and removed.
 *  Every time an action is added to the store a unique id is
 *  returned much in the same way as with `setTimeout`. This id
 *  can be used to reference that particular action for later
 *  removal.
 *
 *      const id = add( EVERY_SECOND, doSomething );
 *      remove( id );
 *
 *  Instead of employing any long-running process to manage
 *  executing the actions, we instead guarantee that a timeout gets
 *  set whenever a new action is added.  If there are no actions
 *  stored for a given interval, that timeout gets cleared to make
 *  sure we don't run for that period.
 *
 *  The scheduling logic all takes place in `scheduleNextRun()`
 *  which is a safe function to call at any time, meaning that it
 *  won't overlap timers or break things if we called it needlessly.
 *
 * @format
 */
export const EVERY_SECOND = 1000;
export const EVERY_FIVE_SECONDS = 5 * 1000;
export const EVERY_TEN_SECONDS = 10 * 1000;
export const EVERY_THIRTY_SECONDS = 30 * 1000;
export const EVERY_MINUTE = 60 * 1000;

const initialState = {
	nextId: 1,
	periodTimers: {
		[ EVERY_SECOND ]: null,
		[ EVERY_FIVE_SECONDS ]: null,
		[ EVERY_TEN_SECONDS ]: null,
		[ EVERY_THIRTY_SECONDS ]: null,
		[ EVERY_MINUTE ]: null,
	},
	actions: [],
};
let state = initialState;

const addToList = item => list => [ ...list, item ];
const removeFromList = id => list => reject( list, { id } );

/**
 * Resets action store and clears timers
 *
 * Please don't use in production. This is only
 * intended to help with testing code.
 */
export const resetForTesting = () => {
	forEach( state.periodTimers, clearTimeout );
	state = initialState;
};

/**
 * Adds an action to the queue on the given interval period
 *
 * @param {number} period one of the constants defining interval periods
 * @param {function} onTick the action to run
 * @returns {number} unique identifier to use to remove action
 */
export function add( period, onTick ) {
	const id = state.nextId;

	storeNewAction( { id, period, onTick } );
	scheduleNextRun();

	return id;
}

function storeNewAction( { id, period, onTick } ) {
	state = {
		...state,
		actions: addToList( { id, period, onTick } )( state.actions ),
		nextId: state.nextId + 1,
	};
}

/**
 * Removes an action from the queue
 *
 * @see add
 *
 * @param {number} id identifier returned by add()
 */
export function remove( id ) {
	removeFromQueue( id );
	scheduleNextRun();
}

function removeFromQueue( id ) {
	state = {
		...state,
		actions: removeFromList( id )( state.actions ),
	};
}

function getPeriodActions( period ) {
	return filter( state.actions, { period } );
}

function hasPeriodActions( period ) {
	return some( state.actions, { period } );
}

function executePeriodActions( period ) {
	// Make sure we don't return `false` or it will
	// halt the iteration in `forEach`
	const callAction = a => a.onTick.call() || true;

	getPeriodActions( period ).forEach( callAction );

	state = {
		...state,
		periodTimers: {
			...state.periodTimers,
			[ period ]: null,
		},
	};
	scheduleNextRun();
}

function scheduleNextRun() {
	[
		EVERY_SECOND,
		EVERY_FIVE_SECONDS,
		EVERY_TEN_SECONDS,
		EVERY_THIRTY_SECONDS,
		EVERY_MINUTE,
	].forEach( p => {
		if ( ! hasPeriodActions( p ) ) {
			state = {
				...state,
				periodTimers: {
					...state.periodTimers,
					[ p ]: clearTimeout( state.periodTimers[ p ] ),
				},
			};
			return;
		}

		if ( ! state.periodTimers[ p ] ) {
			// Note that the second `p` in the call here gets passed as an arg to `executePeriodActions`
			state = {
				...state,
				periodTimers: {
					...state.periodTimers,
					[ p ]: setTimeout( executePeriodActions, p, p ),
				},
			};
		}
	} );
}

/**
 * External dependencies
 */
import { fromJS } from 'immutable';

export const EVERY_SECOND = 1000;
export const EVERY_FIVE_SECONDS = 5 * 1000;
export const EVERY_TEN_SECONDS = 10 * 1000;
export const EVERY_THIRTY_SECONDS = 30 * 1000;
export const EVERY_MINUTE = 60 * 1000;

const initialState = fromJS( {
	nextId: 1,
	periodTimers: {
		EVERY_SECOND: null,
		EVERY_FIVE_SECONDS: null,
		EVERY_TEN_SECONDS: null,
		EVERY_THIRTY_SECONDS: null,
		EVERY_MINUTE: null
	},
	actions: []
} );
let state = initialState;

const increment = a => a + 1;
const addToList = item => list => list.push( item );
const removeFromList = id => list => list.filterNot( o => o.get( 'id' ) === id );

/**
 * Resets action store and clears timers
 *
 * Please don't use in production. This is only
 * intended to help with testing code.
 */
export const resetForTesting = () => {
	state
		.get( 'periodTimers' )
		.forEach( clearTimeout );

	state = initialState;
};

/**
 * Adds an action to the queue on the given interval period
 *
 * @param period one of the constants defining interval periods
 * @param {function} onTick the action to run
 * @returns {number} unique identifier to use to remove action
 */
export function add( period, onTick ) {
	const id = state.get( 'nextId' );

	storeNewAction( { id, period, onTick } );
	scheduleNextRun();

	return id;
}

function storeNewAction( { id, period, onTick } ) {
	state = state
		.update( 'actions', addToList( fromJS( { id, period, onTick } ) ) )
		.update( 'nextId', increment );
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
	state = state.update( 'actions', removeFromList( id ) );
}

function getPeriodActions( period ) {
	return state
		.get( 'actions' )
		.filter( a => a.get( 'period' ) === period );
}

function hasPeriodActions( period ) {
	return state
		.get( 'actions' )
		.some( a => a.get( 'period' ) === period );
}

function executePeriodActions( period ) {
	// Make sure we don't return `false` or it will
	// halt the iteration in `forEach`
	const callAction = a => a.get( 'onTick' ).call() || true;

	getPeriodActions( period ).forEach( callAction );

	state = state.setIn( [ 'periodTimers', period ], null );
	scheduleNextRun();
}

function scheduleNextRun() {
	[ EVERY_SECOND, EVERY_FIVE_SECONDS, EVERY_TEN_SECONDS, EVERY_THIRTY_SECONDS, EVERY_MINUTE ]
		.forEach( p => {
			if ( ! hasPeriodActions( p ) ) {
				state = state.updateIn( [ 'periodTimers', p ], clearTimeout );
				return;
			}

			if ( ! state.get( 'periodTimers' ).get( p ) ) {
				// Note that the second `p` in the call here gets passed as an arg to `executePeriodActions`
				state = state.setIn( [ 'periodTimers', p ], setTimeout( executePeriodActions, p, p ) );
			}
		} );
}

/**
 * External dependencies
 */
import { overSome, includes, first, last, drop, dropRight } from 'lodash';

/**
 * Default options for withHistory reducer enhancer. Refer to withHistory
 * documentation for options explanation.
 *
 * @see withHistory
 *
 * @type {Object}
 */
const DEFAULT_OPTIONS = {
	resetTypes: [],
	ignoreTypes: [],
	shouldOverwriteState: () => false,
};

/**
 * Higher-order reducer creator which transforms the result of the original
 * reducer into an object tracking its own history (past, present, future).
 *
 * @param {?Object}   options                      Optional options.
 * @param {?Array}    options.resetTypes           Action types upon which to
 *                                                 clear past.
 * @param {?Array}    options.ignoreTypes          Action types upon which to
 *                                                 avoid history tracking.
 * @param {?Function} options.shouldOverwriteState Function receiving last and
 *                                                 current actions, returning
 *                                                 boolean indicating whether
 *                                                 present should be merged,
 *                                                 rather than add undo level.
 *
 * @return {Function} Higher-order reducer.
 */
const withHistory = ( options = {} ) => ( reducer ) => {
	options = { ...DEFAULT_OPTIONS, ...options };

	// `ignoreTypes` is simply a convenience for `shouldOverwriteState`
	options.shouldOverwriteState = overSome( [
		options.shouldOverwriteState,
		( action ) => includes( options.ignoreTypes, action.type ),
	] );

	const initialState = {
		past: [],
		present: reducer( undefined, {} ),
		future: [],
	};

	let lastAction;
	let shouldCreateUndoLevel = false;

	const {
		resetTypes = [],
		shouldOverwriteState = () => false,
	} = options;

	return ( state = initialState, action ) => {
		const { past, present, future } = state;
		const previousAction = lastAction;

		lastAction = action;

		switch ( action.type ) {
			case 'UNDO':
				// Can't undo if no past.
				if ( ! past.length ) {
					return state;
				}

				return {
					past: dropRight( past ),
					present: last( past ),
					future: [ present, ...future ],
				};
			case 'REDO':
				// Can't redo if no future.
				if ( ! future.length ) {
					return state;
				}

				return {
					past: [ ...past, present ],
					present: first( future ),
					future: drop( future ),
				};

			case 'CREATE_UNDO_LEVEL':
				shouldCreateUndoLevel = true;
				return state;
		}

		const nextPresent = reducer( present, action );

		if ( includes( resetTypes, action.type ) ) {
			return {
				past: [],
				present: nextPresent,
				future: [],
			};
		}

		if ( present === nextPresent ) {
			return state;
		}

		let nextPast = past;

		shouldCreateUndoLevel = ! past.length || shouldCreateUndoLevel;

		if ( shouldCreateUndoLevel || ! shouldOverwriteState( action, previousAction ) ) {
			nextPast = [ ...past, present ];
		}

		shouldCreateUndoLevel = false;

		return {
			past: nextPast,
			present: nextPresent,
			future: [],
		};
	};
};

export default withHistory;

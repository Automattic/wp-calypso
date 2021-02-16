/**
 * External dependencies
 */
import { merge } from 'lodash';
import type { Action, AnyAction } from 'redux';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';

type AnyThunkAction = ThunkAction< any, any, any, AnyAction >;

function isThunk( action: Action | AnyThunkAction ): action is AnyThunkAction {
	return 'function' === typeof action;
}

/**
 * Given an action object or thunk, returns an updated object or thunk which
 * will include additional data in the action (as provided) when dispatched.
 *
 * @param  {(Function|object)} action Action object or thunk
 * @param  {object}            data   Additional data to include in action
 * @returns {(Function|object)}        Augmented action object or thunk
 * @see client/state/utils/withEnhancers for a more advanced alternative
 */
export default function extendAction< TAction extends Action | AnyThunkAction >(
	action: TAction,
	data: Record< string, unknown > = {}
): TAction {
	if ( ! isThunk( action ) ) {
		return merge( {}, action, data ) as TAction;
	}

	return ( ( dispatch, getState, ...extraArgs ) => {
		const newDispatch = ( a: AnyAction ) => dispatch( extendAction( a, data ) as AnyAction );
		return action(
			newDispatch as ThunkDispatch< unknown, unknown, AnyAction >,
			getState,
			...extraArgs
		);
	} ) as TAction;
}

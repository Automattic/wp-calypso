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
 * @see 'client/state/utils/with-enhancers' for a more advanced alternative
 * @param action Action object or thunk
 * @param data   Additional data to include in action
 * @returns Augmented action object or thunk
 */
function extendAction< TAction extends Action | AnyThunkAction >(
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

export default extendAction;

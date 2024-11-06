import type { Action, AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

type AnyThunkAction = ThunkAction< any, any, any, AnyAction >;

type Enhancer = ( action: AnyAction, getState: () => any ) => AnyAction;

/**
 * Dispatches the specified Redux action creator once enhancers have been applied to the result of its call. Enhancers
 * have access to the state tree and can be used to modify an action, e.g. to add an additional property to an analytics
 * event.
 * @param {Function} actionCreator - Redux action creator function
 * @param {Function|Array} enhancers - either a single function or a list of functions that can be used to modify a Redux action
 * @returns {Function} enhanced action creator
 * @see client/state/analytics/actions/enhanceWithSiteType for an example
 * @see extendAction from @automattic/state-utils for a simpler alternative
 */
export const withEnhancers =
	< TActionArguments extends any[] >(
		actionCreator: ( ...args: TActionArguments ) => Action | AnyThunkAction,
		enhancers: Enhancer | Enhancer[]
	) =>
	( ...args: TActionArguments ): AnyThunkAction => {
		const action = actionCreator( ...args );

		if ( ! Array.isArray( enhancers ) ) {
			enhancers = [ enhancers ];
		}

		return ( dispatch, getState, extraArguments ) => {
			const enhanceAction = ( actionValue: AnyAction ) =>
				( enhancers as Enhancer[] ).reduce(
					( result: AnyAction, enhancer ) => enhancer( result, getState ),
					actionValue
				);
			const enhancedDispatch = ( actionValue: AnyAction ) =>
				dispatch( enhanceAction( actionValue ) );
			const thunkDispatch = ( actionValue: AnyAction | AnyThunkAction ) => {
				if ( typeof actionValue === 'function' ) {
					return actionValue( thunkDispatch, getState, extraArguments );
				}

				return enhancedDispatch( actionValue );
			};

			return thunkDispatch( action );
		};
	};

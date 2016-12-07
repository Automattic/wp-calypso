/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { ANALYTICS_EVENT_RECORD } from 'state/action-types';

/**
 * Returns the event ids triggered after an action has been dispatched.
 * This is usefull to avoid triggering those events twice
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const reducer = createReducer( {}, {
	[ ANALYTICS_EVENT_RECORD ]: ( state, { meta: { analytics } } ) => {
		return {
			...state,
			...analytics
				.filter( action => action.payload.eventId )
				.reduce( ( memo, action ) => {
					return {
						...memo,
						[ action.payload.eventId ]: true
					};
				}, {} )
		};
	}
} );

export default reducer;

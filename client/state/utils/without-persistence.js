/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { getInitialState } from './get-initial-state';

/**
 * Wraps a reducer such that it won't persist any state to the browser's local storage
 *
 * @example prevent a simple reducer from persisting
 * const age = ( state = 0, { type } ) =>
 *   GROW === type
 *     ? state + 1
 *     : state
 *
 * export default combineReducers( {
 *   age: withoutPersistence( age )
 * } )
 *
 * @example preventing a large reducer from persisting
 * const posts = withoutPersistence( keyedReducer( 'postId', post ) )
 *
 * @param {Function} reducer original reducer
 * @returns {Function} wrapped reducer
 */
export const withoutPersistence = ( reducer ) => {
	const wrappedReducer = ( state, action ) => {
		switch ( action.type ) {
			case SERIALIZE:
				return undefined;
			case DESERIALIZE:
				return getInitialState( reducer );
			default:
				return reducer( state, action );
		}
	};
	wrappedReducer.hasCustomPersistence = true;

	return wrappedReducer;
};

/**
 * External dependencies
 */
import isPlainObject from 'lodash/lang/isPlainObject';
import includes from 'lodash/collection/includes';

/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';
import warn from 'lib/warn';

/**
 * Tracks the current page state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export default function( state = {}, action ) {
	switch ( action.type ) {
		case SET_PAGE_STATE:
			if ( isPlainObject( action.value ) ) {
				warn(
					'Don\'t store complex objects in page UI state. They should be split into ' +
					'individual properties or are deserving of their own state reducer.'
				);
				break;
			}

			if (
				! includes( [ 'string', 'number', 'boolean' ], typeof action.value ) &&
				! Array.isArray( action.value )
			) {
				warn(
					'Attempted to store unsupported value type in page UI state. Must be one of: ' +
					'string, number, array, or boolean.'
				);
				break;
			}

			state = Object.assign( {}, state, {
				[ action.key ]: action.value
			} );
			break;
		case RESET_PAGE_STATE:
			state = {};
			break;
	}

	return state;
}

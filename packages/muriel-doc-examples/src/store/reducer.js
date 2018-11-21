/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { combineReducers } from '@wordpress/data';

export function examples( state = {}, action ) {
    if ( 'ADD_EXAMPLES' === action.type ) {
        return {
            ...state,
            ...keyBy( action.examples, 'slug' )
        };
    }

    return state;
}

export default combineReducers( {
    examples
} );

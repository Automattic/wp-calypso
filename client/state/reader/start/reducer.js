/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
    READER_START_GRADUATE_REQUEST,
    READER_START_GRADUATED,
    READER_START_GRADUATE_REQUEST_SUCCESS,
    READER_START_GRADUATE_REQUEST_FAILURE,
    SERIALIZE,
    DESERIALIZE,
} from 'state/action-types';

/**
 * Returns the updated "graduation" from cold start request state after an
 * action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingGraduation(state = false, action) {
    switch (action.type) {
        case READER_START_GRADUATE_REQUEST:
        case READER_START_GRADUATE_REQUEST_SUCCESS:
        case READER_START_GRADUATE_REQUEST_FAILURE:
            return READER_START_GRADUATE_REQUEST === action.type;

        case SERIALIZE:
        case DESERIALIZE:
            return false;
    }

    return state;
}

/**
 * Returns the state of the user's Reader recommendations. New users are shown
 * the cold start recommendations, while regular / graduated users are shown
 * the normal recs.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function hasGraduated(state = null, action) {
    switch (action.type) {
        case READER_START_GRADUATED:
            return true;

        case SERIALIZE:
        case DESERIALIZE:
            return null;
    }

    return state;
}

export default combineReducers({
    hasGraduated,
    isRequestingGraduation,
});

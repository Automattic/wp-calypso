/**
 * External Dependencies
 */

import { combineReducers } from 'redux';
import uniqBy from 'lodash/uniqBy';

/**
 * Internal Dependencies
 */
import {
    GOOGLE_APPS_USERS_FETCH,
    GOOGLE_APPS_USERS_FETCH_COMPLETED,
    GOOGLE_APPS_USERS_FETCH_FAILED,
    SERIALIZE,
    DESERIALIZE,
} from 'state/action-types';

export function items(state = [], action) {
    switch (action.type) {
        case GOOGLE_APPS_USERS_FETCH_COMPLETED:
            return uniqBy(state.concat(action.items), 'email');
        case SERIALIZE:
            return [];
        case DESERIALIZE:
            return [];
    }
    return state;
}

export function loaded(state = false, action) {
    switch (action.type) {
        case GOOGLE_APPS_USERS_FETCH:
        case SERIALIZE:
        case DESERIALIZE:
            return false;
        case GOOGLE_APPS_USERS_FETCH_FAILED:
        case GOOGLE_APPS_USERS_FETCH_COMPLETED:
            return true;
    }
    return state;
}

export default combineReducers({
    items,
    loaded,
});

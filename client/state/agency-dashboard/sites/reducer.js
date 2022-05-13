import {
	JETPACK_DASHBOARD_SITES_FETCH,
	JETPACK_DASHBOARD_SITES_FETCH_SUCCESS,
	JETPACK_DASHBOARD_SITES_FETCH_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	current: [],
	error: null,
};

export const hasFetched = ( state = initialState.isFetching, action ) => {
	switch ( action.type ) {
		case JETPACK_DASHBOARD_SITES_FETCH_SUCCESS:
		case JETPACK_DASHBOARD_SITES_FETCH_FAILURE:
			return true;
	}

	return state;
};

export const isFetching = ( state = initialState.isFetching, action ) => {
	switch ( action.type ) {
		case JETPACK_DASHBOARD_SITES_FETCH:
			return true;
		case JETPACK_DASHBOARD_SITES_FETCH_SUCCESS:
		case JETPACK_DASHBOARD_SITES_FETCH_FAILURE:
			return false;
	}

	return state;
};

const current = ( state = initialState.current, action ) => {
	switch ( action.type ) {
		case JETPACK_DASHBOARD_SITES_FETCH_SUCCESS:
			if ( action?.payload?.items.length === 0 ) {
				// Ignore the partner if all of it does not have any keys or all of its keys are disabled.
				return null;
			}
			return action.payload.items;
	}

	return state;
};

export const error = ( state = initialState.error, action ) => {
	switch ( action.type ) {
		case JETPACK_DASHBOARD_SITES_FETCH_FAILURE:
			return action.error;
	}

	return state;
};

export default combineReducers( {
	hasFetched,
	isFetching,
	current,
	error,
} );

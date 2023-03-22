import {
	STATS_SUBSCRIBERS_RECEIVE,
	STATS_SUBSCRIBERS_REQUEST,
	STATS_SUBSCRIBERS_REQUEST_SUCCESS,
	STATS_SUBSCRIBERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
// import { combineReducers } from 'calypso/state/utils';

const initialState = {
	subscribers: [],
};

const SubscribrsData = ( state = initialState.subscribers, action ) => {
	switch ( action.type ) {
		case STATS_SUBSCRIBERS_REQUEST_SUCCESS:
			return [ ...state, ...action.subscribers ];
	}

	return state;
};

export default SubscribrsData;

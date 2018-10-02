/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	COMMUNITY_EVENTS_REQUEST,
	COMMUNITY_EVENTS_RECEIVE,
	COMMUNITY_EVENTS_REQUEST_FAILURE,
} from 'state/action-types';

const events = createReducer(
	{},
	{
		[ COMMUNITY_EVENTS_REQUEST ]: state => ( {
			...state,
			isLoading: true,
			events: [],
			error: null,
		} ),
		[ COMMUNITY_EVENTS_RECEIVE ]: ( state, action ) => ( {
			...state,
			isLoading: false,
			events: action.events,
			error: null,
		} ),
		[ COMMUNITY_EVENTS_REQUEST_FAILURE ]: ( state, action ) => ( {
			...state,
			isLoading: false,
			events: [],
			error: action.error,
		} ),
	}
);

export default events;

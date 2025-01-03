import { combineReducers } from 'calypso/state/utils';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_REQUEST:
			return {
				...state,
				requesting: {
					...state.requesting,
					[ action.userId ]: true,
				},
			};
		case READER_USER_REQUEST_SUCCESS:
			return {
				...state,
				[ action.userId ]: action.userData,
				requesting: {},
			};
		case READER_USER_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: null,
				requesting: {},
			};
	}
	return state;
};

export default combineReducers( {
	items,
} );

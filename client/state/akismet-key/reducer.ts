import { withStorageKey } from '@automattic/state-utils';
import { AnyAction, combineReducers } from 'redux';
import {
	AKISMET_KEY_REQUEST,
	AKISMET_KEY_RECIEVE,
	AKISMET_KEY_REQUEST_FAILURE,
} from 'calypso/state/action-types';

export const key = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case AKISMET_KEY_RECIEVE:
			return action.key;
	}

	return state;
};

export const error = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case AKISMET_KEY_REQUEST_FAILURE:
			return action.error;
	}

	return state;
};

export const isFetching = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case AKISMET_KEY_REQUEST:
			return true;
		case AKISMET_KEY_RECIEVE:
		case AKISMET_KEY_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	key,
	error,
	isFetching,
} );

export default withStorageKey( 'akismetKey', combinedReducer );

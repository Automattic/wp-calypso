import { AnyAction } from 'redux';
import { combineReducers } from 'calypso/state/utils';
import {
	A4A_GET_CLIENT_REQUEST,
	A4A_GET_CLIENT_SUCCESS,
	A4A_GET_CLIENT_ERROR,
} from './action-types';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	client: null,
	error: null,
};

export const hasFetched = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case A4A_GET_CLIENT_SUCCESS:
			return true;
	}

	return state;
};

export const client = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case A4A_GET_CLIENT_SUCCESS:
			return action.client;
	}

	return state;
};

export const isFetching = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case A4A_GET_CLIENT_REQUEST:
			return true;

		case A4A_GET_CLIENT_SUCCESS:
		case A4A_GET_CLIENT_ERROR:
			return false;
	}

	return state;
};

export const error = ( state = initialState.error, action: AnyAction ) => {
	switch ( action.type ) {
		case A4A_GET_CLIENT_ERROR:
			return action.error;
	}

	return state;
};

export default combineReducers( {
	hasFetched,
	isFetching,
	client,
	error,
} );

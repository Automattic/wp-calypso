import { withStorageKey } from '@automattic/state-utils';
import {
	ASYNC_TOAST_REQUEST,
	ASYNC_TOAST_REQUEST_SUCCESS,
	ASYNC_TOAST_REQUEST_FAILURE,
	ASYNC_TOAST_RECEIVE,
	ASYNC_TOAST_DELETE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { AsyncToastState } from './types';
import type { AnyAction } from 'redux';

const isRequesting = ( state: AsyncToastState[ 'isRequesting' ] = false, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_REQUEST:
			return true;
		case ASYNC_TOAST_REQUEST_SUCCESS:
			return false;
		case ASYNC_TOAST_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const isStale = ( state: AsyncToastState[ 'isStale' ] = true, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_REQUEST:
			return true;
		case ASYNC_TOAST_REQUEST_SUCCESS:
			return false;
		case ASYNC_TOAST_REQUEST_FAILURE:
			return true;
		case ASYNC_TOAST_DELETE:
			return true;
	}

	return state;
};

const toasts = ( state: AsyncToastState[ 'toasts' ] = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_RECEIVE: {
			state[ action.siteId ] = action.toasts;
			return state;
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	isRequesting,
	isStale,
	toasts,
} );

export default withStorageKey( 'asyncToast', combinedReducer );

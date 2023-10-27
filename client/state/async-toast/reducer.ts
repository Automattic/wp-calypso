import { withStorageKey } from '@automattic/state-utils';
import {
	ASYNC_TOAST_REQUEST,
	ASYNC_TOAST_REQUEST_SUCCESS,
	ASYNC_TOAST_REQUEST_FAILURE,
	ASYNC_TOAST_RECEIVE,
	ASYNC_TOAST_DELETE,
	ASYNC_TOAST_DELETE_SUCCESS,
	ASYNC_TOAST_DELETE_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { AsyncToast, AsyncToastKey, AsyncToastMap, AsyncToastState } from './types';
import type { AnyAction } from 'redux';

const isRequesting = ( state: AsyncToastState[ 'isRequesting' ] = false, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_REQUEST:
		case ASYNC_TOAST_DELETE:
			return true;
		case ASYNC_TOAST_RECEIVE:
		case ASYNC_TOAST_REQUEST_FAILURE:
		case ASYNC_TOAST_DELETE_SUCCESS:
		case ASYNC_TOAST_DELETE_FAILURE:
			return false;
	}

	return state;
};

const isStale = ( state: AsyncToastState[ 'isStale' ] = true, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_REQUEST_SUCCESS:
		case ASYNC_TOAST_RECEIVE:
			return false;
		case ASYNC_TOAST_DELETE_SUCCESS:
		case ASYNC_TOAST_DELETE_FAILURE:
			return true;
	}

	return state;
};

const toasts = ( state: AsyncToastMap = new Map(), action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_RECEIVE: {
			const toasts: Map< AsyncToastKey, AsyncToast > = new Map(
				Object.entries( action.payload.toasts )
			);
			if ( typeof action.siteId === 'number' ) {
				state.set( action.siteId, toasts );
			}
			return state;
		}
		case ASYNC_TOAST_DELETE: {
			const siteId = action.siteId;
			if ( typeof siteId !== 'number' ) {
				return state;
			}
			const toastKey = action.toastKey;
			if ( typeof toastKey !== 'string' ) {
				return state;
			}
			const siteToasts = state.get( siteId );
			if ( siteToasts === undefined ) {
				return state;
			}
			siteToasts.delete( toastKey );
			state.set( siteId, siteToasts );
			return state;
		}
	}
	return state;
};

const lastFetch = ( state: AsyncToastState[ 'lastFetch' ] = 0, action: AnyAction ) => {
	switch ( action.type ) {
		case ASYNC_TOAST_RECEIVE:
			return Date.now();
	}
	return state;
};

const combinedReducer = combineReducers( {
	isRequesting,
	isStale,
	toasts,
	lastFetch,
} );

export default withStorageKey( 'asyncToast', combinedReducer );

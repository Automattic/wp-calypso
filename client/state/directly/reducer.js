/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZING,
	DIRECTLY_INITIALIZED,
	DIRECTLY_INITIALIZATION_ERROR
} from 'state/action-types';

export const initialSiteState = {
	hasInitialized: null,
	error: null,
	config: null
};

const isInitializing = ( state = false, action ) => {
	switch ( action.type ) {
		case DIRECTLY_INITIALIZING:
			return true;
		case DIRECTLY_INITIALIZED:
		case DIRECTLY_INITIALIZATION_ERROR:
			return false;
	}
	return state;
};

const isReady = ( state = false, action ) => {
	switch ( action.type ) {
		case DIRECTLY_INITIALIZED:
			return true;
		case DIRECTLY_INITIALIZING:
		case DIRECTLY_INITIALIZATION_ERROR:
			return false;
	}
	return state;
};

const error = ( state = null, action ) => {
	switch ( action.type ) {
		case DIRECTLY_INITIALIZATION_ERROR:
			return action.error;
		case DIRECTLY_INITIALIZING:
		case DIRECTLY_INITIALIZED:
			return null;
	}
	return state;
};

const config = ( state = null, action ) => {
	switch ( action.type ) {
		case DIRECTLY_INITIALIZING:
			return action.config;
	}
	return state;
};

export default combineReducers( { isInitializing, isReady, error, config } );

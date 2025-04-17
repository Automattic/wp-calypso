import { AnyAction } from 'redux';
import { combineReducers } from 'calypso/state/utils';
import {
	JETPACK_GET_AGENCIES_REQUEST,
	JETPACK_GET_AGENCIES_SUCCESS,
	JETPACK_GET_AGENCIES_ERROR,
	JETPACK_CURRENT_AGENCY_UPDATE,
	JETPACK_SET_AGENCY_CLIENT_USER,
} from './action-types';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	activeAgency: null,
	agencies: [],
	error: null,
};

export const hasFetched = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_GET_AGENCIES_SUCCESS:
		case JETPACK_SET_AGENCY_CLIENT_USER:
			return true;
	}

	return state;
};

export const agencies = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_GET_AGENCIES_SUCCESS:
			return action.agencies;
	}

	return state;
};

export const isAgencyClientUser = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_SET_AGENCY_CLIENT_USER: {
			return action.isClientUser;
		}
	}

	return state;
};

export const userBillingType = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_SET_AGENCY_CLIENT_USER: {
			return action.billingType;
		}
	}

	return state;
};

export const isFetching = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_GET_AGENCIES_REQUEST:
			return true;

		case JETPACK_GET_AGENCIES_SUCCESS:
		case JETPACK_GET_AGENCIES_ERROR:
		case JETPACK_SET_AGENCY_CLIENT_USER:
			return false;
	}

	return state;
};

const activeAgency = ( state = initialState.activeAgency, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_CURRENT_AGENCY_UPDATE:
			return action.activeAgency;
	}

	return state;
};

export const error = ( state = initialState.error, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_GET_AGENCIES_ERROR:
			return action.error;
	}

	return state;
};

export default combineReducers( {
	hasFetched,
	isFetching,
	activeAgency,
	agencies,
	error,
	isAgencyClientUser,
	userBillingType,
} );

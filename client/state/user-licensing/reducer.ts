import { withStorageKey } from '@automattic/state-utils';
import { AnyAction } from 'redux';
import {
	USER_LICENSES_RECEIVE,
	USER_LICENSES_REQUEST,
	USER_LICENSES_REQUEST_SUCCESS,
	USER_LICENSES_REQUEST_FAILURE,
	USER_LICENSES_COUNTS_RECEIVE,
	USER_LICENSES_COUNTS_REQUEST,
	USER_LICENSES_COUNTS_REQUEST_SUCCESS,
	USER_LICENSES_COUNTS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { LicenseCounts, PaginatedItems, License } from 'calypso/state/user-licensing/types';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';

export const initialState = {
	licensesFetching: false,
	hasFetchedLicenses: false,
	licenses: null,
	countsFetching: false,
	hasFetchedLicenseCounts: false,
	counts: null,
};

export const countsFetching = (
	state: AppState = false,
	action: AnyAction
): AppState | boolean => {
	switch ( action.type ) {
		case USER_LICENSES_COUNTS_REQUEST:
			return true;

		case USER_LICENSES_COUNTS_REQUEST_SUCCESS:
		case USER_LICENSES_COUNTS_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const counts = (
	state: AppState = initialState.counts,
	action: AnyAction
): AppState | LicenseCounts => {
	switch ( action.type ) {
		case USER_LICENSES_COUNTS_RECEIVE:
			return action.counts;
	}

	return state;
};

export const hasFetchedLicenseCounts = (
	state = initialState.hasFetchedLicenseCounts,
	action: AnyAction
): AppState | boolean => {
	switch ( action.type ) {
		case USER_LICENSES_COUNTS_RECEIVE:
			return true;
	}

	return state;
};

export const licensesFetching = (
	state: AppState = initialState.licensesFetching,
	action: AnyAction
): AppState | boolean => {
	switch ( action.type ) {
		case USER_LICENSES_REQUEST:
			return true;

		case USER_LICENSES_REQUEST_SUCCESS:
		case USER_LICENSES_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const licenses = (
	state: AppState = initialState.licenses,
	action: AnyAction
): AppState | PaginatedItems< License > => {
	switch ( action.type ) {
		case USER_LICENSES_RECEIVE:
			return action.licenses;
	}

	return state;
};

export const hasFetchedLicenses = (
	state = initialState.hasFetchedLicenses,
	action: AnyAction
): AppState | boolean => {
	switch ( action.type ) {
		case USER_LICENSES_RECEIVE:
			return true;
	}

	return state;
};

const combinedReducer = combineReducers( {
	licensesFetching,
	hasFetchedLicenses,
	licenses,
	countsFetching,
	hasFetchedLicenseCounts,
	counts,
} );

export default withStorageKey( 'userLicensing', combinedReducer );

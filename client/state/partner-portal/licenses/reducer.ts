/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_RECEIVE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	paginated: null,
	counts: {
		[ LicenseFilter.Attached ]: 0,
		[ LicenseFilter.Detached ]: 0,
		[ LicenseFilter.Revoked ]: 0,
		[ LicenseFilter.NotRevoked ]: 0,
	},
};

export const hasFetched = ( state = initialState.hasFetched, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE:
			return true;
	}

	return state;
};

export const isFetching = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_LICENSES_REQUEST:
			return true;

		case JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE:
			return false;
	}

	return state;
};

export const paginated = ( state = initialState.paginated, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE:
			return action.paginatedLicenses;
	}

	return state;
};

export const counts = ( state = initialState.counts, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_RECEIVE:
			return action.counts;
	}

	return state;
};

export default combineReducers( {
	hasFetched,
	isFetching,
	paginated,
	counts,
} );

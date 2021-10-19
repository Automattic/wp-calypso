import { AnyAction } from 'redux';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
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
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import { ReduxDispatch } from 'calypso/state/redux-store';
import {
	LicenseCounts,
	PaginatedItems,
	License,
	UserLicensingThunkAction,
} from 'calypso/state/user-licensing/types';
import 'calypso/state/data-layer/wpcom/user-licensing';
import 'calypso/state/user-licensing/init';

/**
 * Licenses Counts actions
 */
export const licensesCountsReceiveAction = ( counts: LicenseCounts ): AnyAction => {
	return {
		type: USER_LICENSES_COUNTS_RECEIVE,
		counts,
	};
};

export const licensesCountsRequestSuccessAction = (): AnyAction => {
	return { type: USER_LICENSES_COUNTS_REQUEST_SUCCESS };
};

export const licensesCountsRequestFailureAction = ( error: string | undefined ): AnyAction => {
	return {
		type: USER_LICENSES_COUNTS_REQUEST_FAILURE,
		error: error,
	};
};

export const requestLicensesCounts = (): AnyAction => ( { type: USER_LICENSES_COUNTS_REQUEST } );

/**
 * Licenses actions
 */
export const licensesReceiveAction = ( licenses: PaginatedItems< License > ): AnyAction => {
	return {
		type: USER_LICENSES_RECEIVE,
		licenses,
	};
};

export const licensesRequestSuccessAction = (): AnyAction => {
	return { type: USER_LICENSES_REQUEST_SUCCESS };
};

export const licensesRequestFailureAction = ( error: string | undefined ): AnyAction => {
	return {
		type: USER_LICENSES_REQUEST_FAILURE,
		error: error,
	};
};

export const requestLicenses = (
	filter?: LicenseFilter,
	search?: string,
	sortField?: LicenseSortField,
	sortDirection?: LicenseSortDirection,
	page?: number
): UserLicensingThunkAction => {
	return ( dispatch: ReduxDispatch ) => {
		dispatch( {
			type: USER_LICENSES_REQUEST,
			filter,
			search,
			sortField,
			sortDirection,
			page: page,
			perPage: LICENSES_PER_PAGE,
		} );

		dispatch( requestLicensesCounts() );
	};
};

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
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
} from 'calypso/state/action-types';
import { ReduxDispatch } from 'calypso/state/redux-store';
import {
	HttpAction,
	License,
	LicenseCounts,
	PaginatedItems,
	PartnerPortalThunkAction,
} from 'calypso/state/partner-portal/types';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

// Required for modular state.
import 'calypso/state/partner-portal/init';

function createHttpAction( action: AnyAction ): HttpAction {
	return {
		...action,
		fetcher: 'wpcomJetpackLicensing',
	};
}

export function fetchLicenses(
	filter: LicenseFilter,
	search: string,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection,
	page: number
): PartnerPortalThunkAction {
	return ( dispatch: ReduxDispatch ): void => {
		dispatch(
			createHttpAction( {
				type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
				filter,
				search,
				sortField,
				sortDirection,
				page: page,
				perPage: LICENSES_PER_PAGE,
			} )
		);

		dispatch( fetchLicenseCounts() );
	};
}

export function receiveLicenses( paginatedLicenses: PaginatedItems< License > ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE, paginatedLicenses };
}

export function fetchLicenseCounts(): HttpAction {
	return createHttpAction( {
		type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
	} );
}

export function receiveLicenseCounts( counts: LicenseCounts ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_RECEIVE, counts };
}

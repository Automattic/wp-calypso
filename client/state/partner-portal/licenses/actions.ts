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
} from 'calypso/state/action-types';
import { HttpAction, License } from 'calypso/state/partner-portal/types';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';

// Required for modular state.
import 'calypso/state/partner-portal/init';

function createHttpAction( action: AnyAction ): HttpAction {
	return {
		...action,
		fetcher: 'wpcomJetpackLicensing',
	};
}

export function fetchLicenses( filter: LicenseFilter, search: string ): HttpAction {
	return createHttpAction( {
		type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
		filter,
		search,
	} );
}

export function receiveLicenses( licenses: License[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE, licenses };
}

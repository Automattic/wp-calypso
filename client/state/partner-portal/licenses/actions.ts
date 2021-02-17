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
import { ReduxDispatch } from 'calypso/state/redux-store';
import { HttpAction, License } from 'calypso/state/partner-portal/types';

// Required for modular state.
import 'calypso/state/partner-portal/init';

function createHttpAction( action: AnyAction ): HttpAction {
	return {
		...action,
		fetcher: 'wpcomJetpackLicensing',
	};
}

export function fetchLicenses( dispatch: ReduxDispatch ): void {
	dispatch(
		createHttpAction( {
			type: JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
		} )
	);
}

export function receiveLicenses( licenses: License[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE, licenses };
}

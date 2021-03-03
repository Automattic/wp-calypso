/**
 * External dependencies
 */
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { ReduxDispatch } from 'calypso/state/redux-store';
import { APIError, Partner, PartnerPortalStore } from 'calypso/state/partner-portal/types';
import {
	getActivePartnerKey,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import wpcom, { wpcomJetpackLicensing } from 'calypso/lib/wp';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey(
	partnerKeyId: number
): ThunkAction< void, PartnerPortalStore, unknown, AnyAction > {
	return ( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ) => {
		if ( isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );

		const key = getActivePartnerKey( getState() );
		wpcomJetpackLicensing.loadToken( key ? key.oauth2_token : '' );
	};
}

export function fetchPartner( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ): void {
	if ( isFetchingPartner( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_REQUEST } );

	wpcom
		.undocumented()
		.getJetpackPartnerPortalPartner()
		.then(
			( partner: Partner ) => {
				dispatch( {
					type: JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS,
					partner,
				} );

				// If we only get a single key, auto-select it for the user for simplicity.
				const keys = partner.keys.map( ( key ) => key.id );

				if ( keys.length === 1 ) {
					dispatch( setActivePartnerKey( keys[ 0 ] ) );
				}
			},
			( error: APIError ) => {
				dispatch( {
					type: JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE,
					error: {
						status: error.status,
						code: error.code || '',
						message: error.message,
					},
				} );
			}
		);
}

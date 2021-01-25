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
import { isFetchingPartner } from 'calypso/state/partner-portal/selectors';
import wpcom from 'calypso/lib/wp';
import { APIError, Partner } from 'calypso/state/partner-portal';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey(
	partnerKeyId: number
): ThunkAction< void, unknown, unknown, AnyAction > {
	return ( dispatch: ReduxDispatch, getState: () => unknown ) => {
		if ( isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );
	};
}

export function fetchPartner( dispatch: ReduxDispatch, getState: () => unknown ): void {
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

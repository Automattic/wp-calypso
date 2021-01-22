/**
 * External dependencies
 */
import { Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { isFetchingPartner } from 'calypso/state/partner-portal/selectors';
import wpcom from 'calypso/lib/wp';
import { APIError, Partner } from 'calypso/state/partner-portal';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey( partnerKeyId: number ) {
	return ( dispatch: Dispatch, getState: () => any ) => {
		if ( isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );
	};
}

export function fetchPartner() {
	return ( dispatch: Dispatch, getState: () => any ) => {
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
						setActivePartnerKey( keys[ 0 ] )( dispatch, getState );
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
	};
}

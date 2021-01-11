/**
 * External dependencies
 */
import { Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST_FAILURE,
	JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { isFetchingPartners } from 'calypso/state/partner-portal/selectors';
import wpcom from 'calypso/lib/wp';
import { APIError, Partner } from 'calypso/state/partner-portal';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey( partnerKeyId: number ) {
	return ( dispatch: Dispatch, getState: () => any ) => {
		if ( isFetchingPartners( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );
	};
}

export function fetchPartners() {
	return ( dispatch: Dispatch, getState: () => any ) => {
		if ( isFetchingPartners( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST } );

		wpcom
			.undocumented()
			.getJetpackPartnerPortalPartners()
			.then(
				( partners: Partner[] ) =>
					dispatch( {
						type: JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
						partners,
					} ),
				( error: APIError ) => {
					dispatch( {
						type: JETPACK_PARTNER_PORTAL_PARTNERS_ALL_REQUEST_FAILURE,
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
